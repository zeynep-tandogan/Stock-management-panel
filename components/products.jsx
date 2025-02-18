import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { productService } from "../services/productService";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";

const ProductsContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 1rem;
  overflow: hidden;
`;

const Title = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ContentContainer = styled.div`
  max-height: ${(props) => (props.isVisible ? "700px" : "0")};
  overflow-y: auto;
  transition: all 0.3s ease-in-out;
  opacity: ${(props) => (props.isVisible ? "1" : "0")};
  padding: ${(props) => (props.isVisible ? "1.5rem" : "0")};
`;

const TableContainer = styled.div`
  margin-top: 1rem;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(147, 112, 219, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #9370db, #8a2be2);
    border-radius: 3px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #eee;
  color: #6c5ce7;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid rgba(147, 112, 219, 0.2);
  border-radius: 5px;
  font-size: 0.9rem;
  width: 200px;

  &:focus {
    outline: none;
    border-color: #6c5ce7;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
`;

const AddButton = styled(Button)`
  background: #6c5ce7;
  color: white;
  &:hover {
    background: #5f3dc4;
  }
`;

const ActionButton = styled(Button)`
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
`;

const EditButton = styled(ActionButton)`
  background: rgba(108, 92, 231, 0.1);
  color: #6c5ce7;
  border: 1px solid rgba(108, 92, 231, 0.2);

  &:hover {
    background: #6c5ce7;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(108, 92, 231, 0.2);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.2);

  &:hover {
    background: #ff6b6b;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(255, 107, 107, 0.2);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ChartSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 2rem;
`;

const ChartTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    stock: "",
    price: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      await productService.createProduct({
        ...newProduct,
        stock: Number(newProduct.stock),
        price: Number(newProduct.price),
      });
      fetchProducts();
      setNewProduct({ productName: "", stock: "", price: "" });
      alert("Ürün başarıyla eklendi");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      productName: product.productName,
      stock: product.stock,
      price: product.price,
    });
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      console.log('Güncellenecek ürün:', editingProduct);
      await productService.updateProduct(editingProduct.id, {
        id: editingProduct.id,
        productName: newProduct.productName,
        stock: Number(newProduct.stock),
        price: Number(newProduct.price),
      });

      fetchProducts();
      setEditingProduct(null);
      setNewProduct({ productName: "", stock: "", price: "" });
      alert("Ürün başarıyla güncellendi");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
        alert("Ürün başarıyla silindi");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setNewProduct({ productName: "", stock: "", price: "" });
  };

  const getStockData = () => {
    const stockRanges = [
      { name: "Kritik Stok (0-3)", range: [0, 3] },
      { name: "Düşük Stok (4-10)", range: [4, 10] },
      { name: "Normal Stok (11-20)", range: [11, 20] },
      { name: "Yüksek Stok (20+)", range: [21, Infinity] }
    ];

    return stockRanges.map(({ name, range }) => ({
      name,
      value: products.filter(product => 
        product.stock >= range[0] && product.stock <= range[1]
      ).length
    })).filter(item => item.value > 0);
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ProductsContainer>
      <Title onClick={() => setIsContentVisible(!isContentVisible)}>
        Ürün Yönetimi {isContentVisible ? "▼" : "▲"}
      </Title>
      <ContentContainer isVisible={isContentVisible}>
        <div>
          <FormGroup>
            <Label>Ürün Adı</Label>
            <Input
              type="text"
              name="productName"
              value={newProduct.productName}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Stok</Label>
            <Input
              type="number"
              name="stock"
              value={newProduct.stock}
              onChange={handleInputChange}
              min="0"
            />
          </FormGroup>
          <FormGroup>
            <Label>Fiyat</Label>
            <Input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </FormGroup>
          {editingProduct ? (
            <ButtonGroup>
              <AddButton onClick={handleUpdate}>Güncelle</AddButton>
              <Button onClick={handleCancel}>İptal</Button>
            </ButtonGroup>
          ) : (
            <AddButton onClick={handleCreate}>Ürün Ekle</AddButton>
          )}
        </div>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Ürün Adı</Th>
                <Th>Stok</Th>
                <Th>Fiyat</Th>
                <Th>İşlemler</Th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <Td>{product.productName}</Td>
                  <Td>{product.stock}</Td>
                  <Td>{product.price.toLocaleString("tr-TR")} ₺</Td>
                  <Td>
                    <ActionButtons>
                      <EditButton onClick={() => handleEdit(product)}>
                        <FiEdit size={16} />
                      </EditButton>
                      <DeleteButton onClick={() => handleDelete(product.id)}>
                        <RiDeleteBinLine size={16} />
                      </DeleteButton>
                    </ActionButtons>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        <ChartSection>
          <ChartTitle>Ürün Stok Durumu</ChartTitle>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={getStockData()}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {getStockData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartSection>
      </ContentContainer>
    </ProductsContainer>
  );
};

export default Products;
