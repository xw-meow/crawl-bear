import React, { createContext, useContext } from "react";
import { COPY, COPY_NO_LINK, MEDIA_ITEMS, MEDIA_ITEMS_NO_LINK, type MediaItem } from "./copy";

/**
 * 影片变体。
 *
 * - `standard`：正常版，演示里会出现真实风格的域名，落版带官网地址。
 * - `noLink`：去外链版，给抖音等对 URL / 平台名敏感的平台用 —— 所有域名换成
 *   `xxxx.xx.com` 占位，「专属解析」不出现平台名（见 `NO_LINK.sites`），
 *   落版改成「私聊作者获取」，整片没有任何网址。
 *
 * 变体由 Root.tsx 里的两个 Composition 分别注入，场景通过 `useCopy()` /
 * `useMediaItems()` 取文案，因此同一套代码可以出两条片子。
 */
export type PromoVariant = "standard" | "noLink";

const VariantContext = createContext<PromoVariant>("standard");

export const PromoVariantProvider: React.FC<{
  variant: PromoVariant;
  children: React.ReactNode;
}> = ({ variant, children }) => (
  <VariantContext.Provider value={variant}>{children}</VariantContext.Provider>
);

export const useVariant = (): PromoVariant => useContext(VariantContext);

/** 当前变体的文案。两个变体字段一致，URL 相关的值不同。 */
export const useCopy = (): typeof COPY | typeof COPY_NO_LINK =>
  useVariant() === "noLink" ? COPY_NO_LINK : COPY;

/** 当前变体的结果页卡片数据（去外链版的域名是占位符）。 */
export const useMediaItems = (): readonly MediaItem[] =>
  useVariant() === "noLink" ? MEDIA_ITEMS_NO_LINK : MEDIA_ITEMS;
