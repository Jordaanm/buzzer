import './SlabBuzzer.css';

export const SlabBuzzer = ({ armed, won, lockedOut, onBuzz }: {
  armed: boolean;
  won: boolean;
  lockedOut: boolean;
  onBuzz: () => void;
}) => {
  const disabled = !armed || lockedOut || won;
  const state = won ? 'won' : lockedOut ? 'locked' : armed ? 'armed' : 'disarmed';

  let label: string, sub: string;
  if (won)            { label = 'BUZZED IN'; sub = 'you were first'; }
  else if (lockedOut) { label = 'LOCKED';    sub = 'too late'; }
  else if (armed)     { label = 'BUZZ';      sub = 'tap to lock in'; }
  else                { label = 'DISARMED';  sub = 'waiting on host'; }

  return (
    <div className="slab-buzzer">
      <button
        disabled={disabled}
        onPointerDown={() => { if (!disabled) onBuzz(); }}
        className={`slab-buzzer__btn slab-buzzer__btn--${state}`}
      >
        <div className="slab-buzzer__label">{label}</div>
        <div className="slab-buzzer__sub">{sub}</div>
      </button>
    </div>
  );
}
