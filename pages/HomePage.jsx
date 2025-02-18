import React from "react";
import Home from "../components/Home";
import styled from "styled-components";

const PageContainer = styled.div`
    background-color: #f5f5f5;
    min-height: 100vh;
`;

const Header = styled.header`
    background-color: #ffffff;
    padding: 15px 30px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const HeaderTitle = styled.h1`
    margin: 0;
    color: #333;
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;

const UserButton = styled.button`
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const ProductsGrid = styled.div`
    padding: 30px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 25px;
    max-width: 1200px;
    margin: 0 auto;
`;

const ProductCard = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s;
    cursor: pointer;

    &:hover {
        transform: translateY(-5px);
    }
`;

const ImageContainer = styled.div`
    position: relative;
    padding-top: 75%;
`;

const ProductImage = styled.img`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const ProductInfo = styled.div`
    padding: 15px;
`;

const ProductName = styled.h3`
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    color: #333;
`;

const PriceContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Price = styled.span`
    font-size: 1.2rem;
    font-weight: bold;
    color: #007bff;
`;

const LoadingContainer = styled.div`
    text-align: center;
    padding: 50px;
`;

const ErrorContainer = styled.div`
    text-align: center;
    padding: 50px;
    color: red;
`;

const QuantityContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 10px 0;
`;

const QuantityButton = styled.button`
    width: 30px;
    height: 30px;
    border: 1px solid #007bff;
    background-color: white;
    color: #007bff;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    
    &:hover {
        background-color: #007bff;
        color: white;
    }
`;

const QuantityDisplay = styled.span`
    font-size: 1.1rem;
    min-width: 30px;
    text-align: center;
`;

const BuyButton = styled.button`
    width: 100%;
    padding: 8px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    
    &:hover {
        background-color: #218838;
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
    color: ${props => props.isLow ? '#dc3545' : '#666'};
    font-weight: ${props => props.isLow ? 'bold' : 'normal'};
`;

const HomePage = () => {
    return (
        <PageContainer>
            <Home 
                StyledComponents={{
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
                    LogoutButton,
                    StockText
                }}
            />
        </PageContainer>
    );
};

export default HomePage;
