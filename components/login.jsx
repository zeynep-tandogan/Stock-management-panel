import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

const floatingItems = keyframes`
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-1000px);
    opacity: 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #f5f0ff 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: "🛍️";
    position: absolute;
    font-size: 24px;
    bottom: -10px;
    left: 5%;
    animation: ${floatingItems} 15s infinite linear;
    cursor: pointer;
    transition: transform 0.5s ease;

    ${(props) =>
      props.mouseNear &&
      `
      transform: translateX(20px) translateY(-20px) scale(1.1);
    `}
  }

  &::after {
    content: "🎁";
    position: absolute;
    font-size: 24px;
    bottom: -10px;
    left: 35%;
    animation: ${floatingItems} 20s infinite linear;
    cursor: pointer;
    transition: transform 0.5s ease;

    ${(props) =>
      props.mouseNear &&
      `
      transform: translateX(-20px) translateY(-20px) scale(1.1);
    `}
  }
`;

const ShoppingIcon = styled.div`
  position: absolute;
  font-size: 20px;
  bottom: -10px;
  opacity: 0.5;
  cursor: pointer;
  transition: all 0.5s ease;

  ${(props) =>
    props.mouseNear &&
    `
    transform: translateY(-30px) scale(1.1);
    opacity: 0.8;
  `}

  &:nth-child(1) {
    left: 15%;
    animation: ${floatingItems} 18s infinite linear 2s;
    &::after {
      content: "👗";
    }
  }

  &:nth-child(2) {
    left: 25%;
    animation: ${floatingItems} 22s infinite linear 4s;
    &::after {
      content: "👜";
    }
  }

  &:nth-child(3) {
    left: 45%;
    animation: ${floatingItems} 25s infinite linear 6s;
    &::after {
      content: "👟";
    }
  }

  &:nth-child(4) {
    left: 65%;
    animation: ${floatingItems} 21s infinite linear 8s;
    &::after {
      content: "💄";
    }
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  background: radial-gradient(
    circle at 30% 50%,
    rgba(230, 230, 250, 0.4) 0%,
    transparent 70%
  );
`;

const BrandSection = styled.div`
  flex: 0.8;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 6rem 4rem;
  animation: ${fadeIn} 1s ease-out;
`;

const FormSection = styled.div`
  flex: 1.2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const LoginForm = styled.form`
  background: rgba(255, 255, 255, 0.9);
  padding: 3rem;
  border-radius: 20px;
  width: 400px;
  box-shadow: 0 10px 25px rgba(147, 112, 219, 0.15);
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 1s ease-out;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  margin: 0.8rem 0;
  border: 2px solid #e6e6fa;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #9370db;
    box-shadow: 0 0 0 3px rgba(147, 112, 219, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 2rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(45deg, #9370db, #8a2be2);
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 15px rgba(147, 112, 219, 0.3);
  }
`;

const Title = styled.div`
  text-align: left;
  margin-bottom: 2rem;

  h1 {
    font-family: "Montserrat", sans-serif;
    font-size: 5rem;
    font-weight: 900;
    line-height: 1.1;
    color: #2d1441;
    position: relative;
    margin: 0;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: -10px;
      width: 80px;
      height: 5px;
      background: linear-gradient(to right, #9370db, #8a2be2);
      border-radius: 3px;
    }
  }

  h2 {
    font-size: 2rem;
    color: #666;
    margin: 0;
    font-weight: 300;
    margin-top: 1rem;
  }
`;

const WelcomeText = styled.p`
  text-align: left;
  color: #4a4a4a;
  font-size: 1.4rem;
  line-height: 1.6;
  margin: 2rem 0;
  font-weight: 300;
  max-width: 600px;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  background-color: #ffe5e5;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    customerName: "",
    password: "",
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isNearIcons, setIsNearIcons] = useState(false);
  const [error, setError] = useState("");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });

    const bottomDistance = rect.height - y;
    setIsNearIcons(bottomDistance < 150);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
        console.log('Login isteği gönderiliyor:', credentials);
        
        const result = await login(credentials.customerName, credentials.password);
        console.log('Login yanıtı:', result);

        if (result.success) {
            console.log('Login başarılı, kullanıcı bilgileri:', {
                customerName: result.user.customerName,
                customerID: result.user.customerID,
                isAdmin: result.user.isAdmin
            });

            localStorage.setItem('customerName', result.user.customerName);
            localStorage.setItem('customerID', result.user.customerID);
            localStorage.setItem('isAdmin', result.user.isAdmin.toString());

            if (result.user.isAdmin) {
                navigate("/admin");
            } else {
                navigate("/home");
            }
        }
    } catch (error) {
        console.error('Login hatası:', error);
        setError(error.message || "Giriş işlemi başarısız!");
    }
  };

  return (
    <LoginContainer mouseNear={isNearIcons} onMouseMove={handleMouseMove}>
      <ShoppingIcon mouseNear={isNearIcons} />
      <ShoppingIcon mouseNear={isNearIcons} />
      <ShoppingIcon mouseNear={isNearIcons} />
      <ShoppingIcon mouseNear={isNearIcons} />
      <ContentWrapper>
        <BrandSection>
          <Title>
            <h1>Alışveriş</h1>
            <h1>Evreni</h1>
            <h2>Modanın Yeni Adresi</h2>
          </Title>
          <WelcomeText>
            Trendleri keşfedin, stilinizi yansıtın. Yeni sezon ürünleriyle
            gardırobunuzu yenileyin.
          </WelcomeText>
        </BrandSection>
        <FormSection>
          <LoginForm onSubmit={handleSubmit}>
            <WelcomeText>
              Hoş geldiniz! Alışverişin keyfini çıkarmak için giriş yapın.
            </WelcomeText>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Input
              type="text"
              name="customerName"
              placeholder="Kullanıcı adınız"
              value={credentials.customerName}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Şifreniz"
              value={credentials.password}
              onChange={handleChange}
              required
            />
            <Button type="submit">Alışverişe Başla</Button>
          </LoginForm>
        </FormSection>
      </ContentWrapper>
    </LoginContainer>
  );
};

export default Login;
