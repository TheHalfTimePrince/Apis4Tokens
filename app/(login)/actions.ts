'use server';

import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  type NewUser,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';
import { getSignIn } from '@/auth';
import { AuthError } from "next-auth";
import { ActionState } from "@/lib/auth/middleware";

// Sign In Schema and use
const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});



export const getUserFromCredentials = async (credentials: { email: string, password: string }) => {
  const { email, password } = credentials;

  const [foundUser] = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

  if (!foundUser) {
    return { error: 'Invalid email or password. Please try again.' };
  }

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return { error: 'Invalid email or password. Please try again.' };
  }

  return foundUser ?? null;
};



const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { email, password } = data;

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return { error: 'User with this email already exists.' };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    role: 'member', // Default role
    tokenBalance: parseInt(process.env.NEXT_PUBLIC_FREE_TOKENS ?? "0"), // Starting token balance
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return { error: 'Failed to create user. Please try again.' };
  }

  const signIn = await getSignIn();

  await signIn('credentials', {
    email: createdUser.email,
    password: password,
    redirect: false,
  });

  redirect('/dashboard');
});

// Sign Out Function
export async function signOut() {
  (await cookies()).delete('session');
  redirect('/sign-in');
}

// Update Password Schema and Function
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    if (currentPassword === newPassword) {
      return {
        error: 'New password must be different from the current password.',
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, user.id));

    return { success: 'Password updated successfully.' };
  }
);

// Delete Account Schema and Function
const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Account deletion failed.' };
    }

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(${user.email}, '-', ${user.id}, '-deleted')`, // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

// Update Account Schema and Function
const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    await db.update(users).set({ name, email }).where(eq(users.id, user.id));

    return { success: 'Account updated successfully.' };
  }
);

export async function signInWithProvider(providerId: string, redirectTo: string = "/dashboard") {
  try {
    const signIn = await getSignIn();
    await signIn(providerId, {
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error(error);
    }
    throw error;
  }
}

export async function handleSignIn(state: ActionState, formData: FormData) {
  try {
    const signIn = await getSignIn();
     await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
    redirect('/dashboard')

  } catch (error) {
    if (error instanceof AuthError) {
      console.error(error);
    }
    throw error;
  }
}
