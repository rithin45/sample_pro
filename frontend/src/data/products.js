const products = [
  {
    id: 1,
    name: "Nike Air Winflo 10",
    variants: [
      {
        color: "OFF WHITE / WOLF GREY",
        colorCode: "#E5E5E5",
        images: {
          main: "https://m.media-amazon.com/images/I/61uyqhEgl7L._SL1500_.jpg",
          sub: ["https://m.media-amazon.com/images/I/61gntjNzxVL._SL1500_.jpg", "https://m.media-amazon.com/images/I/710Jw8DrnuL._SL1500_.jpg"]
        },
        sizes: [{ size: 7, stock: 5, price: 8495 }, { size: 8, stock: 0, price: 8495 }, { size: 9, stock: 10, price: 8495 }]
      },
      {
        color: "CARGO KHAKI / SPRUCE FOG",
        colorCode: "#4B5320",
        images: {
          main: "https://m.media-amazon.com/images/I/611RJyNMBFL._SL1500_.jpg",
          sub: ["https://m.media-amazon.com/images/I/617P8njzo3L._SL1500_.jpg", "https://m.media-amazon.com/images/I/61ZNt0CpQcL._SL1500_.jpg"]
        },
        sizes: [{ size: 7, stock: 3, price: 8995 }, { size: 10, stock: 5, price: 8995 }]
      }
    ]
  },
  {
    id: 2,
    name: "Puma Softride Frequence",
    variants: [
      {
        color: "WARM WHITE / GRAY ECHO",
        colorCode: "#F0F0F0",
        images: {
          main: "https://m.media-amazon.com/images/I/51+wjOh0yuL._SL1500_.jpg",
          sub: ["https://m.media-amazon.com/images/I/414jxBYg7XL._SL1500_.jpg", "https://m.media-amazon.com/images/I/51sxAPegkDL._SL1500_.jpg"]
        },
        sizes: [{ size: 7, stock: 10, price: 5599 }, { size: 8, stock: 12, price: 5599 }]
      },
      {
        color: "BLACK / FLAT DARK GRAY",
        colorCode: "#1F1F1F",
        images: {
          main: "https://m.media-amazon.com/images/I/51MUunUQgkL._SL1500_.jpg",
          sub: ["https://m.media-amazon.com/images/I/41pBgKpBiHL._SL1500_.jpg", "https://m.media-amazon.com/images/I/51O4BauQjGL._SL1500_.jpg"]
        },
        sizes: [{ size: 8, stock: 20, price: 5999 }, { size: 9, stock: 15, price: 5999 }]
      }
    ]
  },
  {
    id: 3,
    name: "Adidas Ultraboost Light",
    variants: [
      {
        color: "White",
        colorCode: "#000000",
        images: {
          main: "https://m.media-amazon.com/images/I/51zF055VY4L._SY675_.jpg",
          sub: ["https://m.media-amazon.com/images/I/411A546PK-L._SY675_.jpg"]
        },
        sizes: [{ size: 8, stock: 5, price: 18999 }, { size: 9, stock: 8, price: 18999 }]
      },
      {
        color: "Black",
        colorCode: "#FFFFFF",
        images: {
          main: "https://m.media-amazon.com/images/I/61UhOzqAbXL._SY675_.jpg",
          sub: ["https://m.media-amazon.com/images/I/512aI+ZyIUL._SY675_.jpg"]
        },
        sizes: [{ size: 9, stock: 10, price: 18999 }]
      }
    ]
  },
  {
    id: 4,
    name: "Nike Air Max Excee",
    variants: [
      {
        color: "BLACK / VOLT",
        colorCode: "#FFFFFF",
        images: {
          main: "https://m.media-amazon.com/images/I/61enWtztGtL._SX569_.jpg",
          sub: ["https://m.media-amazon.com/images/I/617Vpw2FDuL._SX569_.jpg"]
        },
        sizes: [{ size: 7, stock: 8, price: 7995 }]
      },
      {
        color: "WHITE/BLACK-PURE PLATINUM",
        colorCode: "#111111",
        images: {
          main: "https://m.media-amazon.com/images/I/61EhzYSznCL._SX569_.jpg",
          sub: ["https://m.media-amazon.com/images/I/71Rn1scJSQL._SX569_.jpg"]
        },
        sizes: [{ size: 8, stock: 12, price: 8295 }]
      }
    ]
  },
  {
    id: 5,
    name: "New Balance 574 V3",
    variants: [
      {
        color: "NIMBUS CLOUD / NAVY",
        colorCode: "#D1D1D1",
        images: {
          main: "https://m.media-amazon.com/images/I/61kNLGQv-AL._SL1500_.jpg",
          sub: ["https://m.media-amazon.com/images/I/615Qo+BOKfL._SL1500_.jpg"]
        },
        sizes: [{ size: 9, stock: 15, price: 9999 }]
      },
      {
        color: "BURGUNDY / WHITE",
        colorCode: "#800020",
        images: {
          main: "https://m.media-amazon.com/images/I/71u9t+5547L._SL1500_.jpg",
          sub: ["https://m.media-amazon.com/images/I/71z780+uF+L._SL1500_.jpg"]
        },
        sizes: [{ size: 9, stock: 4, price: 10499 }]
      }
    ]
  },
  {
    id: 6,
    name: "Nike Court Vision Low",
    variants: [
      {
        color: "WHITE / UNIVERSITY RED",
        colorCode: "#FFFFFF",
        images: {
          main: "https://m.media-amazon.com/images/I/61hFIgg13xL._SX679_.jpg",
          sub: ["https://m.media-amazon.com/images/I/71RnhVOvcML._SX679_.jpg",
            "https://m.media-amazon.com/images/I/61LVmym51sL._SX679_.jpg"
          ]
        },
        sizes: [{ size: 7, stock: 15, price: 5695 }]
      }
    ]
  },
  {
    id: 7,
    name: "Adidas Forum Mod Low",
    variants: [
      {
        color: "CLOUD WHITE / TAN",
        colorCode: "#F5F5F5",
        images: {
          main: "https://m.media-amazon.com/images/I/51s6xH3ETtL._SY695_.jpg",
          sub: ["https://m.media-amazon.com/images/I/51pMK7uxPyL._SY675_.jpg"]
        },
        sizes: [{ size: 8, stock: 10, price: 11999 }]
      }
    ]
  },
  {
    id: 8,
    name: "Puma RS-X Efekt",
    variants: [
      {
        color: "Warm White-Granola",
        colorCode: "#555555",
        images: {
          main: "https://m.media-amazon.com/images/I/61oMFvXNltL._SY695_.jpg",
          sub: ["https://m.media-amazon.com/images/I/61WmHoJqpWL._SY695_.jpg"]
        },
        sizes: [{ size: 8, stock: 12, price: 9999 }]
      }
    ]
  },
  
];

export default products;