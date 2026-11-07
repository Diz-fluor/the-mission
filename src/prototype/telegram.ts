type TelegramApp = { initData?: string; ready?: () => void; expand?: () => void; setHeaderColor?: (color: string) => void; setBackgroundColor?: (color: string) => void; close?: () => void; BackButton?: { show: () => void; hide: () => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void } };
declare global { interface Window { Telegram?: { WebApp?: TelegramApp } } }
export function getTelegram() { return window.Telegram?.WebApp; }
export function initializeTelegram() { const app = getTelegram(); app?.ready?.(); app?.expand?.(); app?.setHeaderColor?.('#090e0c'); app?.setBackgroundColor?.('#090e0c'); }
export function isTelegram() { return Boolean(getTelegram()?.initData); }
