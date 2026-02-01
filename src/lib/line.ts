/**
 * LINE Messaging API utilities
 * Use this to send messages back to users
 */

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN || "";
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || "";

const LINE_API_BASE = "https://api.line.me/v2/bot";

/**
 * Send reply message to user
 * @param replyToken - Token from webhook event
 * @param messages - Array of message objects
 */
export async function replyMessage(
  replyToken: string,
  messages: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>
) {
  if (!LINE_ACCESS_TOKEN) {
    const errorMsg = "LINE_ACCESS_TOKEN is not set in environment variables. Please add it to .env.local";
    console.error("❌", errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/message/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `LINE API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      // ให้ error message ที่ชัดเจนขึ้น
      if (response.status === 401) {
        errorMessage = "LINE_ACCESS_TOKEN is invalid or expired. Please check your .env.local file and get a new token from LINE Developer Console.";
      }

      console.error("❌ LINE API error:", errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Failed to send LINE message:", error);
    throw error;
  }
}

/**
 * Send push message to user
 * @param userId - LINE user ID
 * @param messages - Array of message objects
 */
export async function pushMessage(
  userId: string,
  messages: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>
) {
  if (!LINE_ACCESS_TOKEN) {
    console.error("LINE_ACCESS_TOKEN is not set");
    return;
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/message/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      throw new Error(`LINE API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send LINE push message:", error);
    throw error;
  }
}

/**
 * Get user profile
 * @param userId - LINE user ID
 */
export async function getUserProfile(userId: string) {
  if (!LINE_ACCESS_TOKEN) {
    console.error("LINE_ACCESS_TOKEN is not set");
    return null;
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get LINE user profile:", error);
    return null;
  }
}

