import React, { memo } from 'react';
import { cfg } from '../lib/config';

/** Decoraciones de temporada sobre la portada (solo visuales, sin interacción). */
const S = (cls: string, box: string, content: React.ReactNode) => (
  <svg className={cls} viewBox={box} aria-hidden="true" focusable="false">
    {content}
  </svg>
);

const GHOST = (
  <>
    <path d="M8 50V25a20 20 0 0 1 40 0v25l-8-5-6 5-6-5-6 5-7-5Z" fill="currentColor" stroke="none" />
    <ellipse cx="21" cy="25" rx="2.8" ry="4" fill="#30271e" stroke="none" />
    <ellipse cx="35" cy="25" rx="2.8" ry="4" fill="#30271e" stroke="none" />
    <path d="M26 36q2 3 4 0" stroke="#30271e" fill="none" strokeWidth="1.5" />
  </>
);

const SNOW = (
  <path d="M12 1v22M2.5 6.5l19 11M2.5 17.5l19-11m-13-3L12 6l3.5-2.5M8.5 20.5 12 18l3.5 2.5" fill="none" />
);

const SPARK = (
  <path d="M12 1 15 9l8 3-8 3-3 8-3-8-8-3 8-3Z" fill="currentColor" stroke="none" />
);

export const SeasonArt = memo(() => {
  const season = cfg('season_active', 'none');
  if (season === 'none') return null;

  let art: React.ReactNode = null;

  if (season === 'halloween') {
    art = (
      <>
        {S('web', '0 0 120 120', (
          <g fill="none">
            <path d="M1 1h113M1 1l106 33M1 1l81 80M1 1l34 104M1 1v113" />
            <path d="M23 1q-2 6 0 7-7 0-7 8-8 0-8 8-1-4-7-1M47 1q-4 10-2 14-12 0-13 17-16 0-17 15-4-2-14-1M76 1q-6 17-4 23-20 1-21 28-27 0-28 22-6-1-22 2M109 1q-8 24-5 32-29 2-31 41-38 0-40 31-8-3-32 4" />
          </g>
        ))}
        {S('ghost', '0 0 56 56', GHOST)}
        {S('ghost small', '0 0 56 56', GHOST)}
        {S('moon', '0 0 30 30', <path d="M21 3a12 12 0 1 0 6 19A13 13 0 0 1 21 3Z" fill="currentColor" stroke="none" />)}
      </>
    );
  }

  if (season === 'christmas') {
    art = (
      <>
        {S('pine', '0 0 110 76', (
          <g fill="none">
            <path d="M0 1q38 28 109 42" />
            <path d="m15 12-8 19m8-19 17-4M31 22l-9 22m9-22 20-6M48 31l-8 24m8-24 23-7M69 37l-7 25m7-25 22-7M91 42l-5 23m5-23 18-9" strokeWidth="2" />
          </g>
        ))}
        {S('baubles', '0 0 100 130', (
          <>
            <path d="M27 0v46M71 0v77" fill="none" stroke="currentColor" />
            <rect x="23" y="46" width="8" height="5" rx="1" fill="currentColor" />
            <circle cx="27" cy="68" r="18" fill="#a74742" stroke="#da8f83" />
            <path d="M18 59q-5 5-4 12" fill="none" stroke="#eed5c2" />
            <rect x="67" y="77" width="8" height="5" rx="1" fill="currentColor" />
            <circle cx="71" cy="97" r="16" fill="#cdbd8c" stroke="#eddfb3" />
            <path d="M66 87q-5 4-5 10" fill="none" stroke="#fff8df" />
          </>
        ))}
        {['one', 'two', 'three', 'four'].map((c) => S(`snowflake ${c}`, '0 0 24 24', SNOW))}
      </>
    );
  }

  if (season === 'newyear') {
    art = (
      <>
        {S('burst', '0 0 84 84', (
          <g fill="none">
            <circle cx="42" cy="42" r="3" fill="currentColor" />
            <path d="M42 31V13m0-6V2M42 53v18m0 6v5M31 42H13m-6 0H2M53 42h18m6 0h5M34 34 20 20m-5-5-4-4M50 50l14 14m5 5 4 4M34 50 20 64m-5 5-4 4M50 34l14-14m5-5 4-4" />
            <path d="m30 15 5 12m14 29 5 12M15 30l12 5m29 14 12 5M15 54l12-5m29-14 12-5M30 69l5-12m14-29 5-12" opacity=".55" />
          </g>
        ))}
        {S('spark', '0 0 24 24', SPARK)}
        {S('spark tiny', '0 0 24 24', SPARK)}
        {S('ribbon', '0 0 40 64', <path d="M5 2q35 7 9 20t15 21q-15 12-8 19" fill="none" strokeWidth="2" />)}
      </>
    );
  }

  if (season === 'blackfriday') {
    art = (
      <>
        {S('bf-tag', '0 0 78 107', (
          <>
            <path d="M38 0v17" fill="none" />
            <path d="M10 40 28 18h23l17 22v57H10Z" fill="currentColor" stroke="none" />
            <circle cx="39" cy="29" r="4" fill="var(--bg)" stroke="none" />
            <text x="39" y="63" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="21" fill="#1a1b16" stroke="none">BF</text>
            <path d="M24 78h30m-25 7h20" stroke="#1a1b16" fill="none" />
          </>
        ))}
        {S('barcode', '0 0 84 28', (
          <path d="M2 2v24M7 2v24M10 2v24M16 2v24M23 2v24M27 2v24M31 2v24M38 2v24M46 2v24M51 2v24M55 2v24M62 2v24M68 2v24M72 2v24M79 2v24M82 2v24" fill="none" />
        ))}
      </>
    );
  }

  return <div className="season-art" aria-hidden="true">{art}</div>;
});
SeasonArt.displayName = 'SeasonArt';
