type IconProps = { className?: string };

export function DiscordIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.5 5.3A16.8 16.8 0 0 0 15.4 4l-.5 1a15.4 15.4 0 0 0-5.8 0l-.5-1a16.6 16.6 0 0 0-4.1 1.3C1.9 9.1 1.2 12.8 1.5 16.4a16.7 16.7 0 0 0 5 2.5l1.2-1.6a9.7 9.7 0 0 1-1.9-.9l.5-.4c3.7 1.7 7.7 1.7 11.4 0l.5.4c-.6.4-1.2.7-1.9 1l1.2 1.5a16.6 16.6 0 0 0 5-2.5c.4-4.2-.7-7.9-3-11.1ZM8.7 14.1c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" /></svg>;
}

export function ArrowIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export function ShieldIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.5 3 7.8 7.5 9.5 4.5-1.7 7.5-5 7.5-9.5V6L12 3Z" /><path d="m8.5 12 2.2 2.2 4.7-4.7" /></svg>;
}
