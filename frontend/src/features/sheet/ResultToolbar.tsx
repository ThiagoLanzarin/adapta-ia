import type { ReactNode } from 'react';

import Icon from '@/shared/ui/Icon';
import { buttonClass, CARD_CLASS } from '@/shared/ui/styles';

import ColorToggle from './ColorToggle';
import PrintButtons from './PrintButtons';

interface ResultToolbarProps {
  /** The name of the adaptation, given by the page (history). */
  title?: ReactNode;
  color: boolean;
  onColorChange: (color: boolean) => void;
  onNew: () => void;
}

/** The actions of the sheet, always in sight on wide screens. */
export default function ResultToolbar({ title, color, onColorChange, onNew }: ResultToolbarProps) {
  return (
    // The canvas-colored band hides the page scrolling between the header and the toolbar.
    <div className="z-20 -mx-2 -mt-4 bg-canvas px-2 pt-4 pb-2 lg:sticky lg:top-[4rem] print:hidden">
      <div className={`${CARD_CLASS} flex flex-wrap items-center gap-x-4 gap-y-3 p-3 sm:p-4`}>
        <div className="min-w-0 flex-1 basis-72">{title}</div>
        <div className="flex flex-wrap items-center gap-2">
          <ColorToggle color={color} onChange={onColorChange} />
          <PrintButtons />
          <button type="button" onClick={onNew} className={buttonClass('ghost', 'md')}>
            <Icon name="plus" />
            Nova adaptação
          </button>
        </div>
      </div>
    </div>
  );
}
