import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { FaShoppingCart, FaMoneyBillWave, FaUserTag } from "react-icons/fa";
import styled from "styled-components";
import { logout } from "../services/authService";
import { orderService } from "../services/orderService";
import { customerService } from "../services/customerService";

const TIMEOUT_DURATION = 15;

const UserInfoContainer = styled.div`
  background: white;
  padding: 1rem;
  margin: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
`;

const UserInfoItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;

  h4 {
    color: #007bff;
    margin: 0 0 0.5rem 0;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 1rem;
`;

const InfoTitle = styled.h4`
  margin: 0;
  color: #007bff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoValue = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
`;

const Home = ({ StyledComponents }) => {
  const {
    Header,
    HeaderTitle,
    ButtonContainer,
    UserButton,
    ProductsGrid,
    ProductCard,
    ImageContainer,
    ProductImage,
    ProductInfo,
    ProductName,
    PriceContainer,
    Price,
    LoadingContainer,
    ErrorContainer,
    QuantityContainer,
    QuantityButton,
    QuantityDisplay,
    BuyButton,
  } = StyledComponents;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const customerName = localStorage.getItem("customerName");
    return customerName || "Misafir";
  });
  const [quantities, setQuantities] = useState(() => {
    const savedQuantities = localStorage.getItem("productQuantities");
    return savedQuantities ? JSON.parse(savedQuantities) : {};
  });
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem("cartTimer");
    return savedTime ? parseFloat(savedTime) : TIMEOUT_DURATION;
  });
  const timerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);

  const MAX_QUANTITY_PER_PRODUCT = 5;

  useEffect(() => {
    localStorage.setItem("productQuantities", JSON.stringify(quantities));
  }, [quantities]);

  const increaseQuantity = (productId) => {
    const product = products.find((p) => p.id === productId);

    if (!product) {
      console.log("Product not found:", productId);
      return;
    }

    const currentQuantity = quantities[productId] || 0;

    // Maksimum limit kontrolü
    if (currentQuantity >= MAX_QUANTITY_PER_PRODUCT) {
      alert("Bir üründen en fazla 5 adet satın alabilirsiniz!");
      return;
    }

    // Stok kontrolü
    if (currentQuantity < product.stock) {
      setQuantities((prev) => {
        const newQuantities = {
          ...prev,
          [productId]: currentQuantity + 1,
        };
        localStorage.setItem(
          "productQuantities",
          JSON.stringify(newQuantities)
        );
        return newQuantities;
      });
    } else {
      alert("Stok limitine ulaşıldı!");
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const customerID = localStorage.getItem("customerID");
        if (customerID) {
          const details = await customerService.getCustomerById(customerID);
          setUserDetails(details);
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const decreaseQuantity = (productId) => {
    setQuantities((prev) => {
      const newQuantities = {
        ...prev,
        [productId]: Math.max((prev[productId] || 0) - 1, 0),
      };
      localStorage.setItem("productQuantities", JSON.stringify(newQuantities));
      return newQuantities;
    });
  };

  const createLog = async (customerID, orderID, logType, logDetails) => {
    try {
      console.log("Log oluşturuluyor:", {
        customerID,
        orderID,
        logType,
        logDetails,
      });
      await orderService.createLog({
        customerID: parseInt(customerID),
        orderID: orderID || 0,
        logDate: new Date().toISOString(),
        logType: logType,
        logDetails: logDetails,
      });
      console.log("Log başarıyla oluşturuldu");
    } catch (error) {
      console.error("Log oluşturma hatası:", error);
    }
  };

  const handleTimeout = async () => {
    const customerID = localStorage.getItem("customerID");
    if (customerID) {
      try {
        console.log("Ana sayfa sepet zaman aşımı logu oluşturuluyor...");
        const timeoutDetails = cart
          .map((item) => `${item.quantity}x ${item.productName}`)
          .join(", ");

        await orderService.createLog({
          customerID: parseInt(customerID),
          orderID: null,
          logDate: new Date().toISOString(),
          logType: "Sepet Zaman Aşımı",
          logDetails: `Ana sayfada sepet zaman aşımına uğradı. İçerik: ${timeoutDetails}`,
        });
        console.log("Ana sayfa zaman aşımı logu oluşturuldu");
      } catch (error) {
        console.error("Ana sayfa zaman aşımı logu oluşturulurken hata:", error);
      }
    }

    setShowTimeoutPopup(true);
    setCart([]);
    localStorage.removeItem("cart");
    localStorage.removeItem("cartTimer");
    localStorage.removeItem("productQuantities");

    setTimeout(() => {
      setShowTimeoutPopup(false);
      window.location.reload(); // Sayfayı yenile
    }, 3000);
  };

  const handlePurchase = async (product) => {
    const customerID = localStorage.getItem("customerID");
    const quantity = quantities[product.id] || 0;

    if (quantity > 0) {
      if (quantity <= product.stock) {
        console.log("Ürün sepete ekleniyor:", { product, quantity });
        const cartItem = {
          id: product.id,
          productName: product.productName,
          price: product.price,
          quantity: quantity,
          stock: product.stock,
        };

        setCart((prevCart) => {
          const updatedCart = [...prevCart];
          const existingItemIndex = updatedCart.findIndex(
            (item) => item.id === product.id
          );

          if (existingItemIndex !== -1) {
            updatedCart[existingItemIndex].quantity += quantity;
          } else {
            updatedCart.push(cartItem);
          }

          localStorage.setItem("cart", JSON.stringify(updatedCart));
          return updatedCart;
        });

        setTimeLeft(TIMEOUT_DURATION);
        localStorage.setItem("cartTimer", TIMEOUT_DURATION.toString());
        startTimer();

        await createLog(
          customerID,
          null,
          "Ürün Sepete Eklendi",
          `${quantity} adet ${product.productName} sepete eklendi. Birim fiyat: $${product.price}`
        );

        alert(`${quantity} adet ${product.productName} sepete eklendi!`);
      } else {
        console.log("Yetersiz stok durumu:", {
          stok: product.stock,
          istenen: quantity,
        });
        await createLog(
          customerID,
          null,
          "Stok Hatası",
          `${product.productName} için yetersiz stok. Mevcut: ${product.stock}, İstenen: ${quantity}`
        );
        alert("Yetersiz stok!");
      }
    } else {
      alert("Lütfen miktar seçiniz!");
    }
  };

  useEffect(() => {
    fetchProducts();
    const customerName = localStorage.getItem("customerName");
    if (customerName) {
      setUser(customerName);
      console.log("Giriş yapan kullanıcı:", customerName);
    }

    const storedUser = localStorage.getItem("user");
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);

      // Eğer sepette ürün varsa timer'ı başlat
      if (parsedCart.length > 0) {
        startTimer();
      }
    }

    // Component unmount olduğunda
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 0.1;
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            handleTimeout(); // Yeni timeout handler
            return TIMEOUT_DURATION;
          }
          localStorage.setItem("cartTimer", newTime.toString());
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [cart]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      console.log("Fetched Products:", data);
      setProducts(data);
    } catch (error) {
      setError("Ürünler yüklenirken bir hata oluştu.");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRedirect = () => {
    navigate("/customer");
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          clearInterval(timerRef.current);
          setShowTimeoutPopup(true);
          setCart([]);
          localStorage.removeItem("cart");
          localStorage.removeItem("cartTimer");

          // Tüm quantities'i sıfırla
          const resetQuantities = {};
          Object.keys(quantities).forEach((key) => {
            resetQuantities[key] = 0;
          });
          setQuantities(resetQuantities);
          localStorage.setItem(
            "productQuantities",
            JSON.stringify(resetQuantities)
          );

          setTimeout(() => {
            setShowTimeoutPopup(false);
          }, 3000);
          return TIMEOUT_DURATION;
        }
        localStorage.setItem("cartTimer", newTime.toString());
        return newTime;
      });
    }, 100);
  };

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <LoadingContainer>
        <h2>Yükleniyor...</h2>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <h2>{error}</h2>
      </ErrorContainer>
    );
  }

  return (
    <>
      {showTimeoutPopup && (
        <TimeoutPopup>
          <PopupContent>
            <h3>Süre Doldu!</h3>
            <p>Sepetiniz zaman aşımına uğradı.</p>
            <p>Seçtiğiniz ürünler sıfırlandı.</p>
          </PopupContent>
        </TimeoutPopup>
      )}

      <Header isScrolled={isScrolled}>
        <HeaderTitle>Product Store</HeaderTitle>
        <ButtonContainer>
          <CartContainer>
            <CartButton onClick={() => navigate("/cart")}>
              <FaShoppingCart />
              <CartCount>
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </CartCount>
            </CartButton>
          </CartContainer>
          <InfoContainer>
            <InfoTitle>
              <FaMoneyBillWave /> Bütçe
            </InfoTitle>
            <InfoValue>${userDetails.budget}</InfoValue>
          </InfoContainer>
          <InfoContainer>
            <InfoTitle>
              <FaUserTag /> Üyelik Tipi
            </InfoTitle>
            <InfoValue>{userDetails.customerType}</InfoValue>
          </InfoContainer>
          <UserButton onClick={handleCustomerRedirect}>{user}</UserButton>
          <LogoutButton onClick={handleLogout}>Çıkış Yap</LogoutButton>
        </ButtonContainer>
      </Header>

      {cart.length > 0 && (
        <TimerContainer isScrolled={isScrolled}>
          <TimerProgressBar>
            <Progress
              width={((timeLeft / TIMEOUT_DURATION) * 100).toFixed(0)}
            />
          </TimerProgressBar>
          <TimeDisplay>{Math.ceil(timeLeft)}s</TimeDisplay>
        </TimerContainer>
      )}

      <ProductsGrid isScrolled={isScrolled}>
        {products.map((product) => (
          <ProductCard key={product.id}>
            <ImageContainer>
              <ProductImage
                src={product.imageUrl || "default-image-url.jpg"}
                alt={product.productName}
              />
            </ImageContainer>
            <ProductInfo>
              <ProductName>{product.productName}</ProductName>
              <PriceContainer>
                <Price>${product.price}</Price>
                <StockText isLow={product.stock <= 3}>
                  Stok: {product.stock}
                </StockText>
              </PriceContainer>
              <QuantityContainer>
                <QuantityButton
                  onClick={() => {
                    console.log("Clicked product ID:", product.id);
                    decreaseQuantity(product.id);
                  }}
                >
                  -
                </QuantityButton>
                <QuantityDisplay>{quantities[product.id] || 0}</QuantityDisplay>
                <QuantityButton
                  onClick={() => {
                    console.log("Clicked product ID:", product.id);
                    increaseQuantity(product.id);
                  }}
                >
                  +
                </QuantityButton>
              </QuantityContainer>
              <BuyButton onClick={() => handlePurchase(product)}>
                Sepete ekle
              </BuyButton>
            </ProductInfo>
          </ProductCard>
        ))}
      </ProductsGrid>
    </>
  );
};

const CartContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CartButton = styled.button`
  position: relative;
  padding: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #007bff;
  font-size: 24px;

  &:hover {
    color: #0056b3;
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
`;

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: ${(props) => (props.isScrolled ? "fixed" : "relative")};
  top: ${(props) => (props.isScrolled ? "50%" : "auto")};
  right: ${(props) => (props.isScrolled ? "20px" : "auto")};
  transform: ${(props) => (props.isScrolled ? "translateY(-50%)" : "none")};
  background: ${(props) =>
    props.isScrolled ? "rgba(255, 255, 255, 0.9)" : "transparent"};
  padding: ${(props) => (props.isScrolled ? "10px" : "0")};
  border-radius: ${(props) => (props.isScrolled ? "8px" : "0")};
  box-shadow: ${(props) =>
    props.isScrolled ? "0 2px 10px rgba(0,0,0,0.1)" : "none"};
  transition: all 0.3s ease;
  z-index: 999;
  width: ${(props) => (props.isScrolled ? "80px" : "100%")};
`;

const TimerProgressBar = styled.div`
  width: 100%;
  height: 3px;
  background-color: #ddd;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 5px;
  transition: all 0.3s ease;
`;

const Progress = styled.div`
  height: 100%;
  width: ${(props) => props.width}%;
  background-color: ${(props) => (props.width <= 33 ? "#ff4444" : "#007bff")};
  transition: width 0.1s linear, background-color 0.3s ease;
`;

const TimeDisplay = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const Header = styled.header`
  position: ${(props) => (props.isScrolled ? "fixed" : "relative")};
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.isScrolled ? "0 2px 4px rgba(0,0,0,0.1)" : "none"};
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem;
  margin-top: ${(props) => (props.isScrolled ? "80px" : "0")};
`;

// Styled components for popup
const TimeoutPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const PopupContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: slideIn 0.3s ease;

  h3 {
    color: #dc3545;
    margin: 0 0 15px 0;
  }

  p {
    margin: 5px 0;
    color: #666;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c82333;
  }
`;

const StockText = styled.span`
  color: ${(props) => (props.isLow ? "#dc3545" : "#666")};
  font-weight: ${(props) => (props.isLow ? "bold" : "normal")};
`;

export default Home;
