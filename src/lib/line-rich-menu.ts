/**
 * LINE Rich Menu utilities
 * Rich Menu คือเมนูที่แสดงที่ด้านล่างของหน้าจอ LINE
 */

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN || "";
const LINE_API_BASE = "https://api.line.me/v2/bot";
// NOTE: Rich Menu image upload/download uses api-data.line.me
const LINE_API_DATA_BASE = "https://api-data.line.me/v2/bot";

/**
 * สร้าง Rich Menu
 * @param richMenu - Rich Menu object ตาม LINE API specification
 */
export async function createRichMenu(richMenu: {
  size: { width: number; height: number };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: Array<{
    bounds: { x: number; y: number; width: number; height: number };
    action: {
      type: string;
      text?: string;
      uri?: string;
      data?: string;
      [key: string]: any;
    };
  }>;
}) {
  if (!LINE_ACCESS_TOKEN) {
    throw new Error("LINE_ACCESS_TOKEN is not set");
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/richmenu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(richMenu),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      throw new Error(`Failed to create rich menu: ${response.status}`);
    }

    const data = await response.json();
    return data.richMenuId;
  } catch (error) {
    console.error("Failed to create rich menu:", error);
    throw error;
  }
}

/**
 * อัปโหลด Rich Menu image
 * @param richMenuId - Rich Menu ID ที่ได้จากการสร้าง
 * @param imageBuffer - Image buffer (PNG หรือ JPEG)
 */
export async function uploadRichMenuImage(
  richMenuId: string,
  imageBuffer: Buffer | ArrayBuffer | Uint8Array
) {
  if (!LINE_ACCESS_TOKEN) {
    throw new Error("LINE_ACCESS_TOKEN is not set");
  }

  try {
    // Convert to ArrayBuffer for Blob
    let arrayBuffer: ArrayBuffer;
    
    if (imageBuffer instanceof Buffer) {
      const buffer = imageBuffer.buffer as ArrayBuffer;
      arrayBuffer = buffer.slice(
        imageBuffer.byteOffset,
        imageBuffer.byteOffset + imageBuffer.byteLength
      );
    } else if (imageBuffer instanceof ArrayBuffer) {
      arrayBuffer = imageBuffer;
    } else if (imageBuffer instanceof Uint8Array) {
      const buffer = imageBuffer.buffer as ArrayBuffer;
      arrayBuffer = buffer.slice(
        imageBuffer.byteOffset,
        imageBuffer.byteOffset + imageBuffer.byteLength
      );
    } else {
      throw new Error("Unsupported image buffer type");
    }
    
    const blob = new Blob([arrayBuffer], { type: "image/png" });

    const response = await fetch(
      `${LINE_API_DATA_BASE}/richmenu/${richMenuId}/content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "image/png",
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
        },
        body: blob,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      throw new Error(`Failed to upload rich menu image: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to upload rich menu image:", error);
    throw error;
  }
}

/**
 * ตั้งค่า Rich Menu ให้กับ LINE OA (default rich menu)
 * @param richMenuId - Rich Menu ID
 */
export async function setDefaultRichMenu(richMenuId: string) {
  if (!LINE_ACCESS_TOKEN) {
    throw new Error("LINE_ACCESS_TOKEN is not set");
  }

  try {
    const response = await fetch(
      `${LINE_API_BASE}/user/all/richmenu/${richMenuId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to set default rich menu: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
        
        // ให้ error message ที่ชัดเจนขึ้น
        if (errorMessage.includes("must upload richmenu image")) {
          errorMessage = "Rich Menu image must be uploaded before setting it as default. Please upload an image first via LINE Developer Console or API.";
        }
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      console.error("LINE API error:", errorMessage);
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error("Failed to set default rich menu:", error);
    throw error;
  }
}

/**
 * ตั้งค่า Rich Menu ให้กับ user เฉพาะ
 * @param userId - LINE User ID
 * @param richMenuId - Rich Menu ID
 */
export async function setUserRichMenu(userId: string, richMenuId: string) {
  if (!LINE_ACCESS_TOKEN) {
    throw new Error("LINE_ACCESS_TOKEN is not set");
  }

  try {
    const response = await fetch(
      `${LINE_API_BASE}/user/${userId}/richmenu/${richMenuId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      throw new Error(`Failed to set user rich menu: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to set user rich menu:", error);
    throw error;
  }
}

/**
 * ดึงรายการ Rich Menu ทั้งหมด
 */
export async function getRichMenuList() {
  if (!LINE_ACCESS_TOKEN) {
    throw new Error("LINE_ACCESS_TOKEN is not set");
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/richmenu/list`, {
      headers: {
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      throw new Error(`Failed to get rich menu list: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get rich menu list:", error);
    throw error;
  }
}

/**
 * ดึงข้อมูล Rich Menu
 * @param richMenuId - Rich Menu ID
 */
export async function getRichMenu(richMenuId: string) {
  if (!LINE_ACCESS_TOKEN) {
    throw new Error("LINE_ACCESS_TOKEN is not set");
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, {
      headers: {
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      throw new Error(`Failed to get rich menu: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get rich menu:", error);
    throw error;
  }
}

/**
 * ลบ Rich Menu
 * @param richMenuId - Rich Menu ID
 */
export async function deleteRichMenu(richMenuId: string) {
  if (!LINE_ACCESS_TOKEN) {
    throw new Error("LINE_ACCESS_TOKEN is not set");
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      throw new Error(`Failed to delete rich menu: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to delete rich menu:", error);
    throw error;
  }
}

/**
 * ยกเลิก Rich Menu ของ user (กลับไปใช้ default)
 * @param userId - LINE User ID
 */
export async function unlinkUserRichMenu(userId: string) {
  if (!LINE_ACCESS_TOKEN) {
    throw new Error("LINE_ACCESS_TOKEN is not set");
  }

  try {
    const response = await fetch(
      `${LINE_API_BASE}/user/${userId}/richmenu`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      throw new Error(`Failed to unlink user rich menu: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to unlink user rich menu:", error);
    throw error;
  }
}

/**
 * ดาวน์โหลด Rich Menu image
 * @param richMenuId - Rich Menu ID
 */
export async function getRichMenuImage(richMenuId: string) {
  if (!LINE_ACCESS_TOKEN) {
    throw new Error("LINE_ACCESS_TOKEN is not set");
  }

  try {
    const response = await fetch(
      `${LINE_API_DATA_BASE}/richmenu/${richMenuId}/content`,
      {
        headers: {
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      throw new Error(`Failed to get rich menu image: ${response.status}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Failed to get rich menu image:", error);
    throw error;
  }
}

