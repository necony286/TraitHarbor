type PaddleEnvironment = 'sandbox' | 'production';

type PaddleCheckoutItem = {
  priceId: string;
  quantity?: number;
};

/**
 * Represents a customer's address for Paddle.js.
 * @see https://developer.paddle.com/reference/paddle-js/parameters/customer
 */
type PaddleAddress = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  countryCode?: string;
  postalCode?: string;
  region?: string;
};

/**
 * Represents a customer's business information for Paddle.js.
 * @see https://developer.paddle.com/reference/paddle-js/parameters/customer
 */
type PaddleBusiness = {
  name?: string;
  taxIdentifier?: string;
};

/**
 * Represents customer details for Paddle.js checkout.
 * @see https://developer.paddle.com/reference/paddle-js/parameters/customer
 */
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
