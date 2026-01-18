type PaddleEnvironment = 'sandbox' | 'production';

type PaddleCheckoutItem = {
  priceId: string;
  quantity?: number;
};

type PaddleCheckoutOptions = {
  items: PaddleCheckoutItem[];
  customer?: {
    email?: string;
  };
  customData?: Record<string, unknown>;
  successCallback?: () => void;
};

type PaddleSdk = {
  Environment: {
    set: (environment: PaddleEnvironment) => void;
  };
  Initialize: (options: { token: string }) => void;
  Checkout: {
    open: (options: PaddleCheckoutOptions) => void;
  };
};

interface Window {
  Paddle?: PaddleSdk;
}
