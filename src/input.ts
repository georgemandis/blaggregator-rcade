import { PLAYER_1 } from "@rcade/plugin-input-classic";
import { PLAYER_1 as SPINNER_1 } from "@rcade/plugin-input-spinners";

export interface Input {
  up: boolean;
  down: boolean;
  a: boolean;
  b: boolean;
  spinnerDelta: number;
}

// Keyboard fallback for spinner when plugin isn't connected
let keyboardSpinnerDelta = 0;

window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "c" || e.key === "C") keyboardSpinnerDelta -= 1;
  if (e.key === "v" || e.key === "V") keyboardSpinnerDelta += 1;
});

export function getInput(): Input {
  const pluginDelta = SPINNER_1.SPINNER.consume_step_delta();
  const keyDelta = keyboardSpinnerDelta;
  keyboardSpinnerDelta = 0;

  return {
    up: PLAYER_1.DPAD.up,
    down: PLAYER_1.DPAD.down,
    a: PLAYER_1.A,
    b: PLAYER_1.B,
    spinnerDelta: pluginDelta + keyDelta,
  };
}
