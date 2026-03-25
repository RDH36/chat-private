import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instant";
import { id } from "@instantdb/react-native";
import { suppressLock, unsuppressLock } from "@/hooks/useLockState";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  quality: 0.7,
  allowsEditing: true,
  base64: true,
};

function xhrUpload(url: string, headers: Record<string, string>, body: ArrayBuffer): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    for (const [k, v] of Object.entries(headers)) {
      xhr.setRequestHeader(k, v);
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); } catch { resolve(null); }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(body);
  });
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binStr = atob(base64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return bytes.buffer;
}

export type PermissionError = { title: string; message: string } | null;

export function useImagePicker() {
  const { t } = useTranslation();
  const [permissionError, setPermissionError] = useState<PermissionError>(null);
  const clearPermissionError = useCallback(() => setPermissionError(null), []);

  const upload = async (
    base64: string,
    ext: string
  ): Promise<{ url: string; path: string } | null> => {
    try {
      const contentType = ext === "png" ? "image/png" : "image/jpeg";
      const fileId = id();
      const storagePath = `chat-images/${fileId}.${ext}`;

      // Get auth token from InstantDB
      const reactor = (db as any)._core._reactor;
      const currentUser = await reactor.getCurrentUser();
      const refreshToken = currentUser?.user?.refresh_token;
      const apiURI = reactor.config.apiURI;
      const appId = reactor.config.appId;

      const buffer = base64ToArrayBuffer(base64);
      await xhrUpload(`${apiURI}/storage/upload`, {
        app_id: appId,
        path: storagePath,
        authorization: `Bearer ${refreshToken}`,
        "content-type": contentType,
      }, buffer);

      const downloadUrl = await db.storage.getDownloadUrl(storagePath);
      if (!downloadUrl) return null;
      return { url: downloadUrl, path: storagePath };
    } catch (e) {
      console.error("[useImagePicker] upload failed:", e);
      return null;
    }
  };

  const pickFromGallery = async (): Promise<{
    url: string;
    path: string;
  } | null> => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionError({ title: t("room.photo"), message: t("room.photoFromGallery") });
      return null;
    }

    suppressLock();
    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    } finally {
      setTimeout(unsuppressLock, 2000);
    }

    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset.base64) return null;
    const ext = (asset.uri.split(".").pop() || "jpg").toLowerCase();
    return upload(asset.base64, ext);
  };

  const pickFromCamera = async (): Promise<{
    url: string;
    path: string;
  } | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPermissionError({ title: t("room.photo"), message: t("room.photoFromCamera") });
      return null;
    }

    suppressLock();
    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    } finally {
      setTimeout(unsuppressLock, 2000);
    }

    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset.base64) return null;
    const ext = (asset.uri.split(".").pop() || "jpg").toLowerCase();
    return upload(asset.base64, ext);
  };

  const uploadFromUri = async (uri: string): Promise<{ url: string; path: string } | null> => {
    try {
      const file = new File(uri);
      const base64 = await file.base64();
      const ext = (uri.split(".").pop() || "jpg").toLowerCase();
      return upload(base64, ext);
    } catch (e) {
      console.error("[useImagePicker] uploadFromUri failed:", e);
      return null;
    }
  };

  return { pickFromGallery, pickFromCamera, uploadFromUri, permissionError, clearPermissionError };
}
