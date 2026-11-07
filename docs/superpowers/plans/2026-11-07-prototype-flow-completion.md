# Prototype flow completion Implementation Plan

**Goal:** Завершить интерактивный демонстрационный прототип по чистовым макетам, включая короткое вступление, полное редактирование, фильтры, возвраты и мобильные размеры.
**Architecture:** Существующие React-экраны Figma, локальное состояние и адаптеры поведения. Реальные оплаты, ИИ и отправки не подключаются.
**Spec:** FIGMA_HANDOFF.md, запросы пользователя в чате; архив 726:5801 не заменяет актуальные экраны.

## Review Focus
- Сохранение личности участника и собственных данных при смене вкладок и возврате.
- Разделение короткой анкеты и полной формы; сохранение, отмена и перезагрузка.
- Кнопка сохранения не должна запускать закладки.
- Контент, таббар, бейджи и карусель при ширинах 320–430, высотах 640–932.
- Шаблонные состояния и демонстрационные операции не выдаются за серверные результаты.

## Task 1: Finish current fixes
Files: Prototype.tsx, own-profile.ts, profile.ts, deals.ts, state.mjs, styles.css.
Complete full edit/save, own preview return, profile tab position, gear scrolling, request/deal tabs and swipe carousel.
Run profile-edit-check, deals-video-check, mobile-check --core and existing regression scripts. Expected: no failed assertions or browser errors. Commit verified changes.

## Task 2: Complete design and flow coverage
Retry pending Figma contexts; import exact screens when available, retain explicit coverage gaps otherwise. Audit onboarding, settings, requests, deals, community and AI with direct browser scenarios. Add regression tests before fixes. Verify changes and commit.

## Task 3: Full verification and handoff
Run unit tests, production build, all browser checks, all 139 screens and mobile coverage. Inspect screenshots of core screens and forms. One fresh review of the accumulated changes, one focused fix pass. Attempt only the authorized feature branch upload; record access blockers without publishing main. Update README and final report with actual checks and remaining limits.

## Progress
- Before this plan: full profile edit/save/preview-return browser check passes. Deals filters and swipe carousel check passes before latest width fixes. Baseline audit rendered 556 screen/size combinations with no JavaScript errors; found nested tabbar positioning and fixed-width content issues. Fixes are in progress and need final rerun.
- Ruling: local-only demo remains the integration boundary, as agreed in the handoff. No real financial, moderation, messaging or AI calls.
- Task 1: editor/save/drafts, own preview, stable profile tabs, scrolling gear, request/deal filters and swipe carousel implemented. Browser scenarios pass.
- Task 2: all 12 pending Figma contexts imported: 139 exact screens, zero placeholders. Short onboarding, full editor, local invitations/settings, independent deals and payment history implemented.
- Final fresh review: seven important scenario issues fixed in one pass: deal chat/composer isolation, editor history, photo draft and edited task/service visibility, global request tab, Maria/counterparty identity, deal terms/deadline/cancellation, and all-deals deletion guard. Covered by isolation-check, editor-return-check, review-regression-check and flow-isolation unit tests. Chat identity unit failed before the fix; photo/back regression exposed a missing editor Back control and then passed.
- Final minor (deferred): participant-count text remains static in some filtered catalog states; cards and empty-result handling work.
- Task 3: final production build and 11/11 unit tests pass. All 139 screens render without JavaScript errors or missing images. Full mobile audit passes 556/556 screen-size combinations at 320×640, 360×780, 393×852 and 430×932. Browser scenario suite passes, including final reruns of Back, profile edit, editor exit/discard, review regressions, chat isolation and remaining flows. Screenshots of community/profile/editor/recommendation/request-confirmation/onboarding inspected. These are browser viewport checks; a physical Telegram-device session has not been performed.
