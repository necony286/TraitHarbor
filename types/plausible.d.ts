type PlausibleProps = Record<string, string | number | boolean | null | undefined>;

type PlausibleOptions = {
  props?: PlausibleProps;
};

type PlausibleFn = (eventName: string, options?: PlausibleOptions) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

export {};
