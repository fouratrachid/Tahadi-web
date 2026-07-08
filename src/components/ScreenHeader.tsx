import { AR } from '@/i18n/ar';

interface Props {
  title: string;
  onBack: () => void;
}

export function ScreenHeader({ title, onBack }: Props) {
  return (
    <header className="flex items-center gap-4 py-4">
      <button
        onClick={onBack}
        className="border-line bg-surface text-accent cursor-pointer rounded-full border px-4 py-1.5 text-sm font-bold transition hover:brightness-125"
      >
        {`‹ ${AR.common.back}`}
      </button>
      <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
    </header>
  );
}
