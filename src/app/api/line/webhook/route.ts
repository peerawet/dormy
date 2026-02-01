import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { replyMessage } from "@/lib/line";

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

// Verify LINE webhook signature
function verifySignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) {
    console.error("LINE_CHANNEL_SECRET is not set");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");

  return hash === signature;
}

// Handle LINE webhook events
async function handleLineEvents(events: any[]) {
  for (const event of events) {
    console.log("LINE Event:", event.type, event);

    switch (event.type) {
      case "message":
        await handleMessageEvent(event);
        break;
      case "follow":
        await handleFollowEvent(event);
        break;
      case "unfollow":
        await handleUnfollowEvent(event);
        break;
      case "postback":
        await handlePostbackEvent(event);
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }
  }
}

// Handle message events
async function handleMessageEvent(event: any) {
  const { message, replyToken, source } = event;

  if (message.type === "text") {
    // Handle text messages
    const userMessage = message.text;
    console.log("User message:", userMessage);

    // Example: Echo back the message
    try {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `คุณส่งข้อความ: ${userMessage}`,
        },
      ]);
    } catch (error) {
      console.error("Failed to reply message:", error);
    }
  }
}

// Handle follow events (when user adds your LINE OA)
async function handleFollowEvent(event: any) {
  console.log("User followed:", event.source.userId);
  // TODO: Save user ID to database, send welcome message, etc.
}

// Handle unfollow events
async function handleUnfollowEvent(event: any) {
  console.log("User unfollowed:", event.source.userId);
  // TODO: Update user status in database
}

// Handle postback events (button clicks, etc.)
async function handlePostbackEvent(event: any) {
  console.log("Postback:", event.postback.data);
  // TODO: Handle postback actions
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!signature) {
      console.error("No signature found");
      return NextResponse.json(
        { error: "No signature" },
        { status: 401 }
      );
    }

    // Verify signature
    if (!verifySignature(body, signature)) {
      console.error("Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook body
    const webhook = JSON.parse(body);

    // Handle webhook events
    if (webhook.events && Array.isArray(webhook.events)) {
      await handleLineEvents(webhook.events);
    }

    // LINE requires 200 OK response within 1 second
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("LINE webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// LINE webhook also supports GET for verification
export async function GET() {
  return NextResponse.json({ 
    message: "LINE Webhook endpoint is active",
    timestamp: new Date().toISOString()
  });
}

