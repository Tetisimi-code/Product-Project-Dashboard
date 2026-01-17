import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client for auth operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-bbcbebd7/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// AUTH ROUTES
// ============================================

// NOTE: Email verification has been disabled
// Users can sign up with any email address without verification

// Configuration: Admin email addresses
// Add admin emails here, separated by commas
const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(email => email.length > 0);

// Configuration: Resend API for email sending
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// NOTE: Email verification functions disabled - no longer sending verification emails
// Users are auto-verified on signup

/* DISABLED - Email verification removed
// Helper function to generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to send verification email
async function sendVerificationEmail(email: string, code: string, name: string): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    const errorMsg = 'RESEND_API_KEY not configured in environment variables';
    console.log(`ERROR: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  // Log API key info for debugging (first/last 4 chars only)
  const keyPrefix = RESEND_API_KEY.substring(0, 4);
  const keySuffix = RESEND_API_KEY.substring(RESEND_API_KEY.length - 4);
  console.log(`Using RESEND_API_KEY: ${keyPrefix}...${keySuffix} (length: ${RESEND_API_KEY.length})`);
  
  // Validate API key format  
  if (!RESEND_API_KEY.startsWith('re_')) {
    console.log(`WARNING: RESEND_API_KEY does not start with 're_' - this is likely invalid`);
  }
  if (RESEND_API_KEY.length < 30) {
    console.log(`WARNING: RESEND_API_KEY is only ${RESEND_API_KEY.length} characters - valid keys are typically 50+ characters`);
  }
  console.log(`Attempting to send verification email to ${email}...`);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Reactive Technologies <onboarding@resend.dev>',
        to: email,
        subject: 'Verify Your Email - Product-Project Management Board',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Welcome to Reactive Technologies!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for signing up for the Product-Project Management Board.</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #7c3aed; font-size: 36px; letter-spacing: 8px; margin: 0;">${code}</h1>
            </div>
            <p>Enter this code in the application to verify your email address.</p>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't sign up for this account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Reactive Technologies Product-Project Management Board<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`ERROR: Resend API returned status ${response.status}: ${error}`);
      return { success: false, error: `Email service error: ${error}` };
    }

    const result = await response.json();
    console.log(`SUCCESS: Email sent to ${email}, message ID: ${result.id}`);
    return { success: true };
  } catch (error) {
    const errorMsg = `Email send exception: ${error}`;
    console.log(`ERROR: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}
END OF DISABLED EMAIL VERIFICATION CODE */

// NOTE: Email domain validation removed - all emails now accepted

// Helper function to check if user is admin
async function isUserAdmin(user: any): Promise<boolean> {
  if (!user || !user.email) return false;
  
  const userEmail = user.email.toLowerCase();
  
  // Check if user's email is in the admin list
  if (ADMIN_EMAILS.includes(userEmail)) {
    return true;
  }
  
  // Check if user is marked as admin in metadata
  if (user.user_metadata?.isAdmin === true) {
    return true;
  }
  
  // Check if this is the first user (auto-admin)
  // This is useful for initial setup
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (!error && users && users.length === 1 && users[0].id === user.id) {
      // This is the only user, make them admin
      // Update their metadata to persist this
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, isAdmin: true }
      });
      return true;
    }
  } catch (e) {
    console.log(`Error checking first user status: ${e}`);
  }
  
  return false;
}

// Health check endpoint to verify environment variables
app.get("/make-server-bbcbebd7/health", async (c) => {
  const hasResendKey = !!RESEND_API_KEY;
  const resendKeyPrefix = hasResendKey ? RESEND_API_KEY.substring(0, 4) : 'N/A';
  const resendKeyLength = hasResendKey ? RESEND_API_KEY.length : 0;
  
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hasResendKey,
      resendKeyPrefix,
      resendKeyLength,
      allowedDomains: ALLOWED_EMAIL_DOMAINS,
      allowedTestEmails: ALLOWED_TEST_EMAILS.length,
      adminEmailsConfigured: ADMIN_EMAILS.length
    }
  });
});

// Sign up endpoint - NOW CREATES PENDING SIGNUP, NOT ACTUAL USER
app.post("/make-server-bbcbebd7/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const emailKey = email.toLowerCase();

    // Check if email already exists in actual users
    const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.find(
      (u: any) => u.email?.toLowerCase() === emailKey
    );
    
    if (existingUser) {
      // If user exists but is unverified (from old flow), delete it and allow new signup
      if (existingUser.user_metadata?.emailVerified === false) {
        console.log(`Deleting unverified account for ${email} to allow new signup`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
        if (deleteError) {
          console.log(`Failed to delete unverified account: ${deleteError.message}`);
          return c.json({ 
            error: "An unverified account exists. Please contact an administrator to remove it." 
          }, 400);
        }
        console.log(`Successfully deleted unverified account for ${email}`);
      } else {
        // User exists and is verified
        return c.json({ error: "An account with this email already exists" }, 400);
      }
    }
    
    // Clean up any existing pending signup
    await kv.del(`pending_signup:${emailKey}`);
    
    // Check if this would be the first user (for auto-admin)
    const { data: { users: currentUsers } } = await supabase.auth.admin.listUsers();
    const isFirstUser = !currentUsers || currentUsers.length === 0;

    // Create user immediately without email verification
    console.log(`Creating user account for ${email}...`);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        isAdmin: isFirstUser,
        emailVerified: true // Auto-verify since we're skipping email verification
      },
      email_confirm: true // Auto-confirm email
    });

    if (error) {
      console.log(`User creation error: ${error.message}`);
      return c.json({ error: `Failed to create account: ${error.message}` }, 400);
    }

    console.log(`SUCCESS: User account created for ${email} (no email verification required)`);
    return c.json({ 
      success: true,
      message: "Account created successfully",
      user: data.user 
    });
  } catch (error) {
    console.log(`Signup exception: ${error}`);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// Verify email with code endpoint - NOW CREATES THE ACTUAL USER ACCOUNT
app.post("/make-server-bbcbebd7/verify-email", async (c) => {
  try {
    const { email, code } = await c.req.json();
    
    if (!email || !code) {
      return c.json({ error: "Email and verification code are required" }, 400);
    }

    const emailKey = email.toLowerCase();

    // Get pending signup from KV store
    const pendingSignup = await kv.get(`pending_signup:${emailKey}`);
    
    if (!pendingSignup) {
      return c.json({ error: "No pending signup found. Please sign up again." }, 404);
    }

    // Check verification code
    if (code !== pendingSignup.verificationCode) {
      return c.json({ error: "Invalid verification code" }, 400);
    }

    // Check if code expired
    if (Date.now() > pendingSignup.codeExpiry) {
      // Clean up expired pending signup
      await kv.del(`pending_signup:${emailKey}`);
      return c.json({ error: "Verification code has expired. Please sign up again." }, 400);
    }

    // Verification successful! Now create the actual user account
    console.log(`Verification successful for ${email}, creating user account...`);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: pendingSignup.email,
      password: pendingSignup.password,
      user_metadata: { 
        name: pendingSignup.name,
        isAdmin: pendingSignup.isFirstUser,
        emailVerified: true
      },
      email_confirm: true // User is verified, confirm immediately
    });

    if (error) {
      console.log(`User creation error after verification: ${error.message}`);
      return c.json({ error: `Failed to create account: ${error.message}` }, 400);
    }

    // Clean up pending signup from KV store
    await kv.del(`pending_signup:${emailKey}`);
    console.log(`SUCCESS: User account created for ${email} after email verification`);

    return c.json({ 
      success: true,
      message: "Email verified and account created successfully",
      user: data.user 
    });
  } catch (error) {
    console.log(`Email verification exception: ${error}`);
    return c.json({ error: "Email verification failed" }, 500);
  }
});

// Resend verification code endpoint - Works with pending signups
app.post("/make-server-bbcbebd7/resend-verification", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const emailKey = email.toLowerCase();

    // Get pending signup from KV store
    const pendingSignup = await kv.get(`pending_signup:${emailKey}`);
    
    if (!pendingSignup) {
      return c.json({ error: "No pending signup found. Please sign up again." }, 404);
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const codeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Update pending signup with new code
    const updatedPendingSignup = {
      ...pendingSignup,
      verificationCode,
      codeExpiry
    };
    
    await kv.set(`pending_signup:${emailKey}`, updatedPendingSignup);

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email, 
      verificationCode, 
      pendingSignup.name
    );
    
    if (!emailResult.success) {
      console.log(`ERROR: Failed to resend verification email to ${email}: ${emailResult.error}`);
      return c.json({ 
        error: `Failed to send verification email: ${emailResult.error}`,
        emailError: emailResult.error
      }, 500);
    }

    console.log(`SUCCESS: Verification email resent to ${email}`);
    return c.json({ 
      success: true,
      message: "Verification code sent to your email"
    });
  } catch (error) {
    console.log(`Resend verification exception: ${error}`);
    return c.json({ error: "Resend verification failed" }, 500);
  }
});

// Update profile endpoint
app.post("/make-server-bbcbebd7/update-profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name } = await c.req.json();
    
    if (!name) {
      return c.json({ error: "Name is required" }, 400);
    }

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { 
        ...user.user_metadata,
        name 
      }
    });

    if (error) {
      console.log(`Profile update error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Profile update exception: ${error}`);
    return c.json({ error: "Profile update failed" }, 500);
  }
});

// Update email endpoint (admin only)
app.post("/make-server-bbcbebd7/update-email", async (c) => {
  try {
    const user = await verifyAdmin(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    const { newEmail } = await c.req.json();
    
    if (!newEmail) {
      return c.json({ error: "New email is required" }, 400);
    }

    // Validate email domain
    if (!isEmailAllowed(newEmail)) {
      return c.json({ 
        error: `Only email addresses from ${ALLOWED_EMAIL_DOMAINS.join(', ')} are allowed` 
      }, 403);
    }

    // Check if email is already in use
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(
      (u: any) => u.email?.toLowerCase() === newEmail.toLowerCase() && u.id !== user.id
    );

    if (emailExists) {
      return c.json({ error: "This email address is already in use" }, 400);
    }

    // Update user email using admin API (bypasses email confirmation)
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email: newEmail,
      email_confirm: true, // Auto-confirm the new email
    });

    if (error) {
      console.log(`Email update error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Email update exception: ${error}`);
    return c.json({ error: "Email update failed" }, 500);
  }
});

// Middleware to verify authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Auth verification failed: No authorization header or invalid format');
    return null;
  }

  const accessToken = authHeader.split(' ')[1];
  
  // Check if using anon key (which is valid for unauthenticated endpoints)
  if (accessToken === supabaseAnonKey) {
    console.log('Auth verification failed: Using anon key instead of user token');
    return null;
  }
  
  // Use the service role client with admin.getUserById to verify the token
  // This is more reliable than creating a new client with the user's token
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log(`Auth verification failed: ${error?.message || 'No user found'} (token may be expired or invalid)`);
      return null;
    }

    return user;
  } catch (err) {
    console.log(`Auth verification exception: ${err}`);
    return null;
  }
}

// Middleware to verify admin status
async function verifyAdmin(authHeader: string | null) {
  const user = await verifyAuth(authHeader);
  if (!user) {
    return null;
  }
  
  const isAdmin = await isUserAdmin(user);
  if (!isAdmin) {
    return null;
  }
  
  return user;
}

// ============================================
// PROJECTS ROUTES
// ============================================

// Get all projects
app.get("/make-server-bbcbebd7/projects", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ 
        error: "Unauthorized", 
        message: "Invalid JWT",
        code: 401
      }, 401);
    }

    const projects = await kv.get('projects') || [];
    return c.json({ projects });
  } catch (error) {
    console.log(`Error fetching projects: ${error}`);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

// Create project
app.post("/make-server-bbcbebd7/projects", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const project = await c.req.json();
    const projects = await kv.get('projects') || [];
    projects.push(project);
    await kv.set('projects', projects);

    return c.json({ project });
  } catch (error) {
    console.log(`Error creating project: ${error}`);
    return c.json({ error: "Failed to create project" }, 500);
  }
});

// Update project
app.put("/make-server-bbcbebd7/projects/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param('id');
    const updatedProject = await c.req.json();
    
    const projects = await kv.get('projects') || [];
    const index = projects.findIndex((p: any) => p.id === projectId);
    
    if (index === -1) {
      return c.json({ error: "Project not found" }, 404);
    }

    projects[index] = updatedProject;
    await kv.set('projects', projects);

    return c.json({ project: updatedProject });
  } catch (error) {
    console.log(`Error updating project: ${error}`);
    return c.json({ error: "Failed to update project" }, 500);
  }
});

// Delete project
app.delete("/make-server-bbcbebd7/projects/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param('id');
    const projects = await kv.get('projects') || [];
    const filtered = projects.filter((p: any) => p.id !== projectId);
    
    await kv.set('projects', filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting project: ${error}`);
    return c.json({ error: "Failed to delete project" }, 500);
  }
});

// ============================================
// FEATURES ROUTES
// ============================================

// Get all features
app.get("/make-server-bbcbebd7/features", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const features = await kv.get('features') || [];
    return c.json({ features });
  } catch (error) {
    console.log(`Error fetching features: ${error}`);
    return c.json({ error: "Failed to fetch features" }, 500);
  }
});

// Create feature
app.post("/make-server-bbcbebd7/features", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const feature = await c.req.json();
    const features = await kv.get('features') || [];
    features.push(feature);
    await kv.set('features', features);

    return c.json({ feature });
  } catch (error) {
    console.log(`Error creating feature: ${error}`);
    return c.json({ error: "Failed to create feature" }, 500);
  }
});

// Update feature
app.put("/make-server-bbcbebd7/features/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const featureId = c.req.param('id');
    const updatedFeature = await c.req.json();
    
    const features = await kv.get('features') || [];
    const index = features.findIndex((f: any) => f.id === featureId);
    
    if (index === -1) {
      return c.json({ error: "Feature not found" }, 404);
    }

    features[index] = updatedFeature;
    await kv.set('features', features);

    return c.json({ feature: updatedFeature });
  } catch (error) {
    console.log(`Error updating feature: ${error}`);
    return c.json({ error: "Failed to update feature" }, 500);
  }
});

// Delete feature
app.delete("/make-server-bbcbebd7/features/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const featureId = c.req.param('id');
    const features = await kv.get('features') || [];
    const filtered = features.filter((f: any) => f.id !== featureId);
    
    await kv.set('features', filtered);

    // Also remove from projects
    const projects = await kv.get('projects') || [];
    const updatedProjects = projects.map((p: any) => ({
      ...p,
      featuresUsed: p.featuresUsed.filter((id: string) => id !== featureId),
      deployedFeatures: p.deployedFeatures.filter((id: string) => id !== featureId),
    }));
    await kv.set('projects', updatedProjects);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting feature: ${error}`);
    return c.json({ error: "Failed to delete feature" }, 500);
  }
});

// ============================================
// CATEGORY ROUTES
// ============================================

// Get category order
app.get("/make-server-bbcbebd7/categories", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const categoryOrder = await kv.get('categoryOrder') || [];
    return c.json({ categoryOrder });
  } catch (error) {
    console.log(`Error fetching categories: ${error}`);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

// Update category order
app.put("/make-server-bbcbebd7/categories", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { categoryOrder } = await c.req.json();
    await kv.set('categoryOrder', categoryOrder);

    return c.json({ categoryOrder });
  } catch (error) {
    console.log(`Error updating categories: ${error}`);
    return c.json({ error: "Failed to update categories" }, 500);
  }
});

// ============================================
// AUDIT LOG ROUTES
// ============================================

// Get all audit entries
app.get("/make-server-bbcbebd7/audit", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const auditLog = await kv.get('auditLog') || [];
    return c.json({ auditLog });
  } catch (error) {
    console.log(`Error fetching audit log: ${error}`);
    return c.json({ error: "Failed to fetch audit log" }, 500);
  }
});

// Create audit entry
app.post("/make-server-bbcbebd7/audit", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const entry = await c.req.json();
    const auditLog = await kv.get('auditLog') || [];
    auditLog.push(entry);
    await kv.set('auditLog', auditLog);

    return c.json({ entry });
  } catch (error) {
    console.log(`Error creating audit entry: ${error}`);
    return c.json({ error: "Failed to create audit entry" }, 500);
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Check if current user is admin
app.get("/make-server-bbcbebd7/admin/check", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const isAdmin = await isUserAdmin(user);
    
    return c.json({ isAdmin, userId: user.id, email: user.email });
  } catch (error) {
    console.log(`Error checking admin status: ${error}`);
    return c.json({ error: "Failed to check admin status" }, 500);
  }
});

// Get team members list (authenticated users only)
app.get("/make-server-bbcbebd7/team-members", async (c) => {
  try {
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken || '');
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Fetch all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.log(`Error listing team members: ${listError.message}`);
      return c.json({ error: "Failed to list team members" }, 500);
    }

    // Return simplified user data (just name and email for dropdown)
    const teamMembers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || u.email?.split('@')[0] || 'Unknown',
    }));

    return c.json({ teamMembers });
  } catch (error) {
    console.log(`Error fetching team members: ${error}`);
    return c.json({ error: "Failed to fetch team members" }, 500);
  }
});

// List all users (admin only)
app.get("/make-server-bbcbebd7/admin/users", async (c) => {
  try {
    const user = await verifyAdmin(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    // Fetch all users using admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log(`Error listing users: ${error.message}`);
      return c.json({ error: "Failed to list users" }, 500);
    }

    // Return simplified user data with admin status
    const userList = await Promise.all(users.map(async (u: any) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || 'Unknown',
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
      isAdmin: await isUserAdmin(u),
    })));

    return c.json({ users: userList });
  } catch (error) {
    console.log(`Error listing users: ${error}`);
    return c.json({ error: "Failed to list users" }, 500);
  }
});

// Delete user (admin only)
app.delete("/make-server-bbcbebd7/admin/users/:userId", async (c) => {
  try {
    const user = await verifyAdmin(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    const userIdToDelete = c.req.param('userId');

    // Prevent self-deletion
    if (userIdToDelete === user.id) {
      return c.json({ error: "Cannot delete your own account via admin panel" }, 400);
    }

    // Delete user using admin API
    const { error } = await supabase.auth.admin.deleteUser(userIdToDelete);

    if (error) {
      console.log(`Error deleting user ${userIdToDelete}: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(`Error deleting user: ${error}`);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// Delete all users (admin only) - WARNING: DESTRUCTIVE
app.delete("/make-server-bbcbebd7/admin/users", async (c) => {
  try {
    const user = await verifyAdmin(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    // Get all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log(`Error listing users for deletion: ${listError.message}`);
      return c.json({ error: "Failed to list users" }, 500);
    }

    let deletedCount = 0;
    let errors = [];

    // Delete all users
    for (const userToDelete of users) {
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
      if (error) {
        console.log(`Error deleting user ${userToDelete.email}: ${error.message}`);
        errors.push({ email: userToDelete.email, error: error.message });
      } else {
        deletedCount++;
        console.log(`Deleted user: ${userToDelete.email}`);
      }
    }

    // Also clean up any pending signups
    const pendingSignups = await kv.getByPrefix('pending_signup:');
    for (const signup of pendingSignups) {
      await kv.del(signup.key);
    }
    console.log(`Cleaned up ${pendingSignups.length} pending signups`);

    return c.json({ 
      success: true, 
      message: `Deleted ${deletedCount} users`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.log(`Error deleting all users: ${error}`);
    return c.json({ error: "Failed to delete all users" }, 500);
  }
});

// Make user an admin (admin only)
app.post("/make-server-bbcbebd7/admin/users/:userId/make-admin", async (c) => {
  try {
    const user = await verifyAdmin(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    const userIdToPromote = c.req.param('userId');

    // Prevent self-promotion (although admins already are admins)
    if (userIdToPromote === user.id) {
      return c.json({ error: "You are already an admin" }, 400);
    }

    // Get the target user
    const { data: { user: targetUser }, error: getUserError } = await supabase.auth.admin.getUserById(userIdToPromote);
    
    if (getUserError || !targetUser) {
      console.log(`Error getting user ${userIdToPromote}: ${getUserError?.message}`);
      return c.json({ error: "User not found" }, 404);
    }

    // Update user metadata to mark them as admin
    const { error: updateError } = await supabase.auth.admin.updateUserById(userIdToPromote, {
      user_metadata: { 
        ...targetUser.user_metadata, 
        isAdmin: true 
      }
    });

    if (updateError) {
      console.log(`Error promoting user ${userIdToPromote} to admin: ${updateError.message}`);
      return c.json({ error: updateError.message }, 500);
    }

    console.log(`User ${targetUser.email} promoted to admin by ${user.email}`);
    return c.json({ success: true, message: "User promoted to admin successfully" });
  } catch (error) {
    console.log(`Error making user admin: ${error}`);
    return c.json({ error: "Failed to promote user to admin" }, 500);
  }
});

// Remove admin from user (admin only)
app.post("/make-server-bbcbebd7/admin/users/:userId/remove-admin", async (c) => {
  try {
    const user = await verifyAdmin(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    const userIdToDemote = c.req.param('userId');

    // Prevent self-demotion
    if (userIdToDemote === user.id) {
      return c.json({ error: "Cannot remove admin privileges from yourself" }, 400);
    }

    // Get the target user
    const { data: { user: targetUser }, error: getUserError } = await supabase.auth.admin.getUserById(userIdToDemote);
    
    if (getUserError || !targetUser) {
      console.log(`Error getting user ${userIdToDemote}: ${getUserError?.message}`);
      return c.json({ error: "User not found" }, 404);
    }

    // Check if user is in ADMIN_EMAILS (cannot demote those)
    if (ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
      return c.json({ error: "Cannot demote users in ADMIN_EMAILS configuration" }, 400);
    }

    // Update user metadata to remove admin status
    const { error: updateError } = await supabase.auth.admin.updateUserById(userIdToDemote, {
      user_metadata: { 
        ...targetUser.user_metadata, 
        isAdmin: false 
      }
    });

    if (updateError) {
      console.log(`Error demoting user ${userIdToDemote} from admin: ${updateError.message}`);
      return c.json({ error: updateError.message }, 500);
    }

    console.log(`Admin privileges removed from ${targetUser.email} by ${user.email}`);
    return c.json({ success: true, message: "Admin privileges removed successfully" });
  } catch (error) {
    console.log(`Error removing admin from user: ${error}`);
    return c.json({ error: "Failed to remove admin privileges" }, 500);
  }
});

// ============================================
// USER SELF-MANAGEMENT
// ============================================

// Delete current user's own account
app.delete("/make-server-bbcbebd7/delete-my-account", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = user.id;

    // Delete user using admin API
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.log(`Error deleting user account ${userId}: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.log(`Error during account self-deletion: ${error}`);
    return c.json({ error: "Failed to delete account" }, 500);
  }
});

// ============================================
// DATA INITIALIZATION
// ============================================

// Initialize with default data (one-time setup)
app.post("/make-server-bbcbebd7/initialize", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { projects, features, categoryOrder, auditLog } = await c.req.json();
    
    // Only initialize if data doesn't exist
    const existingProjects = await kv.get('projects');
    if (!existingProjects || existingProjects.length === 0) {
      await kv.set('projects', projects || []);
      await kv.set('features', features || []);
      await kv.set('categoryOrder', categoryOrder || []);
      await kv.set('auditLog', auditLog || []);
      
      return c.json({ success: true, message: "Data initialized" });
    }

    return c.json({ success: false, message: "Data already exists" });
  } catch (error) {
    console.log(`Error initializing data: ${error}`);
    return c.json({ error: "Failed to initialize data" }, 500);
  }
});

// ============================================
// ATLASSIAN INTEGRATION ROUTES
// ============================================

// Helper to make Atlassian API requests
async function fetchAtlassian(url: string, email: string, token: string, options: any = {}) {
  const auth = btoa(`${email}:${token}`);
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });
  return response;
}

// Get Atlassian configuration
app.get("/make-server-bbcbebd7/atlassian/config", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const jiraConfig = await kv.get(`atlassian:jira:config:${user.id}`);
    const confluenceConfig = await kv.get(`atlassian:confluence:config:${user.id}`);

    return c.json({
      jira: jiraConfig || null,
      confluence: confluenceConfig || null,
    });
  } catch (error) {
    console.log(`Error getting Atlassian config: ${error}`);
    return c.json({ error: "Failed to get configuration" }, 500);
  }
});

// Save Jira configuration
app.post("/make-server-bbcbebd7/atlassian/jira/config", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { url, email, token } = await c.req.json();

    if (!url || !email || !token) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Test connection before saving
    try {
      const testUrl = `${url}/rest/api/3/myself`;
      const response = await fetchAtlassian(testUrl, email, token);
      
      if (!response.ok) {
        return c.json({ error: "Invalid Jira credentials" }, 401);
      }
    } catch (error) {
      return c.json({ error: "Failed to connect to Jira" }, 500);
    }

    // Save configuration (token encrypted in real production)
    await kv.set(`atlassian:jira:config:${user.id}`, {
      url,
      email,
      token, // In production, encrypt this!
      connected: true,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving Jira config: ${error}`);
    return c.json({ error: "Failed to save configuration" }, 500);
  }
});

// Save Confluence configuration
app.post("/make-server-bbcbebd7/atlassian/confluence/config", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { url, email, token } = await c.req.json();

    if (!url || !email || !token) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Test connection before saving
    try {
      const testUrl = `${url}/rest/api/user/current`;
      const response = await fetchAtlassian(testUrl, email, token);
      
      if (!response.ok) {
        return c.json({ error: "Invalid Confluence credentials" }, 401);
      }
    } catch (error) {
      return c.json({ error: "Failed to connect to Confluence" }, 500);
    }

    // Save configuration
    await kv.set(`atlassian:confluence:config:${user.id}`, {
      url,
      email,
      token, // In production, encrypt this!
      connected: true,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving Confluence config: ${error}`);
    return c.json({ error: "Failed to save configuration" }, 500);
  }
});

// Test Jira connection
app.get("/make-server-bbcbebd7/atlassian/jira/test", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const config = await kv.get(`atlassian:jira:config:${user.id}`);
    if (!config) {
      return c.json({ error: "Jira not configured" }, 400);
    }

    const response = await fetchAtlassian(
      `${config.url}/rest/api/3/serverInfo`,
      config.email,
      config.token
    );

    if (!response.ok) {
      return c.json({ success: false, error: "Connection failed" });
    }

    const data = await response.json();
    return c.json({ success: true, siteName: data.serverTitle || 'Jira' });
  } catch (error) {
    console.log(`Error testing Jira connection: ${error}`);
    return c.json({ error: "Failed to test connection" }, 500);
  }
});

// Test Confluence connection
app.get("/make-server-bbcbebd7/atlassian/confluence/test", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const config = await kv.get(`atlassian:confluence:config:${user.id}`);
    if (!config) {
      return c.json({ error: "Confluence not configured" }, 400);
    }

    const response = await fetchAtlassian(
      `${config.url}/rest/api/user/current`,
      config.email,
      config.token
    );

    if (!response.ok) {
      return c.json({ success: false, error: "Connection failed" });
    }

    const data = await response.json();
    return c.json({ success: true, siteName: data.displayName || 'Confluence' });
  } catch (error) {
    console.log(`Error testing Confluence connection: ${error}`);
    return c.json({ error: "Failed to test connection" }, 500);
  }
});

// Disconnect Jira
app.delete("/make-server-bbcbebd7/atlassian/jira/disconnect", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await kv.del(`atlassian:jira:config:${user.id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error disconnecting Jira: ${error}`);
    return c.json({ error: "Failed to disconnect" }, 500);
  }
});

// Disconnect Confluence
app.delete("/make-server-bbcbebd7/atlassian/confluence/disconnect", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await kv.del(`atlassian:confluence:config:${user.id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error disconnecting Confluence: ${error}`);
    return c.json({ error: "Failed to disconnect" }, 500);
  }
});

// Get Jira projects
app.get("/make-server-bbcbebd7/atlassian/jira/projects", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const config = await kv.get(`atlassian:jira:config:${user.id}`);
    if (!config) {
      return c.json({ error: "Jira not configured" }, 400);
    }

    const response = await fetchAtlassian(
      `${config.url}/rest/api/3/project`,
      config.email,
      config.token
    );

    if (!response.ok) {
      return c.json({ error: "Failed to fetch projects" }, 500);
    }

    const projects = await response.json();
    return c.json({ projects });
  } catch (error) {
    console.log(`Error fetching Jira projects: ${error}`);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

// Link project to Jira
app.post("/make-server-bbcbebd7/atlassian/jira/link", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { projectId, jiraKey } = await c.req.json();

    const config = await kv.get(`atlassian:jira:config:${user.id}`);
    if (!config) {
      return c.json({ error: "Jira not configured" }, 400);
    }

    // Get project from database
    const projects = await kv.get('projects') || [];
    const projectIndex = projects.findIndex((p: any) => p.id === projectId);
    
    if (projectIndex === -1) {
      return c.json({ error: "Project not found" }, 404);
    }

    // Update project with Jira link
    projects[projectIndex].jiraKey = jiraKey;
    projects[projectIndex].jiraUrl = `${config.url}/browse/${jiraKey}`;
    await kv.set('projects', projects);

    return c.json({ 
      success: true, 
      jiraUrl: projects[projectIndex].jiraUrl 
    });
  } catch (error) {
    console.log(`Error linking project to Jira: ${error}`);
    return c.json({ error: "Failed to link project" }, 500);
  }
});

// Create Jira issue
app.post("/make-server-bbcbebd7/atlassian/jira/create-issue", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { projectId, featureId, summary, description, issueType } = await c.req.json();

    const config = await kv.get(`atlassian:jira:config:${user.id}`);
    if (!config) {
      return c.json({ error: "Jira not configured" }, 400);
    }

    // Get project to find Jira key
    const projects = await kv.get('projects') || [];
    const project = projects.find((p: any) => p.id === projectId);
    
    if (!project || !project.jiraKey) {
      return c.json({ error: "Project not linked to Jira" }, 400);
    }

    // Create Jira issue
    const response = await fetchAtlassian(
      `${config.url}/rest/api/3/issue`,
      config.email,
      config.token,
      {
        method: 'POST',
        body: JSON.stringify({
          fields: {
            project: {
              key: project.jiraKey,
            },
            summary,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: description,
                    },
                  ],
                },
              ],
            },
            issuetype: {
              name: issueType || 'Task',
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.log(`Jira API error: ${error}`);
      return c.json({ error: "Failed to create issue" }, 500);
    }

    const issue = await response.json();
    const issueUrl = `${config.url}/browse/${issue.key}`;

    return c.json({ 
      success: true, 
      issueKey: issue.key,
      issueUrl,
    });
  } catch (error) {
    console.log(`Error creating Jira issue: ${error}`);
    return c.json({ error: "Failed to create issue" }, 500);
  }
});

// Get Confluence spaces
app.get("/make-server-bbcbebd7/atlassian/confluence/spaces", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const config = await kv.get(`atlassian:confluence:config:${user.id}`);
    if (!config) {
      return c.json({ error: "Confluence not configured" }, 400);
    }

    const response = await fetchAtlassian(
      `${config.url}/rest/api/space`,
      config.email,
      config.token
    );

    if (!response.ok) {
      return c.json({ error: "Failed to fetch spaces" }, 500);
    }

    const data = await response.json();
    return c.json({ spaces: data.results || [] });
  } catch (error) {
    console.log(`Error fetching Confluence spaces: ${error}`);
    return c.json({ error: "Failed to fetch spaces" }, 500);
  }
});

// Link project to Confluence
app.post("/make-server-bbcbebd7/atlassian/confluence/link", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { projectId, pageId, pageUrl } = await c.req.json();

    // Get project from database
    const projects = await kv.get('projects') || [];
    const projectIndex = projects.findIndex((p: any) => p.id === projectId);
    
    if (projectIndex === -1) {
      return c.json({ error: "Project not found" }, 404);
    }

    // Update project with Confluence link
    projects[projectIndex].confluencePageId = pageId;
    projects[projectIndex].confluencePageUrl = pageUrl;
    await kv.set('projects', projects);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error linking project to Confluence: ${error}`);
    return c.json({ error: "Failed to link project" }, 500);
  }
});

Deno.serve(app.fetch);