type PaddleEnvironment = 'sandbox' | 'production';

type PaddleCheckoutItem = {
  priceId: string;
  quantity?: number;
};

type PaddleAddress = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  countryCode?: string;
  postalCode?: string;
  region?: string;
};

type PaddleBusiness = {
  name?: string;
  taxIdentifier?: string;
};

type PaddleCustomer = {
  email?: string;
  address?: PaddleAddress;
  business?: PaddleBusiness;
};

type PaddleCheckoutOptions = {
  items: PaddleCheckoutItem[];
  customer?: PaddleCustomer;
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
