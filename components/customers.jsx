import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { customerService } from "../services/customerService";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";

const CustomersContainer = styled.div`
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

const CustomerTypeBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${(props) =>
    props.type === "Premium"
      ? "rgba(108, 92, 231, 0.1)"
      : "rgba(64, 192, 87, 0.1)"};
  color: ${(props) => (props.type === "Premium" ? "#6c5ce7" : "#40c057")};
`;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [newCustomer, setNewCustomer] = useState({
    customerName: "",
    budget: "",
    customerType: "Standard",
  });
  const [editingCustomer, setEditingCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStandard = async () => {
    if (!newCustomer.customerName || !newCustomer.budget) {
      alert("Lütfen müşteri adı ve bütçe giriniz");
      return;
    }
    try {
      await customerService.createStandardCustomer(
        newCustomer.customerName,
        Number(newCustomer.budget)
      );
      fetchCustomers();
      setNewCustomer({
        customerName: "",
        budget: "",
        customerType: "Standard",
      });
      alert("Standart müşteri başarıyla eklendi");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreatePremium = async () => {
    if (!newCustomer.customerName || !newCustomer.budget) {
      alert("Lütfen müşteri adı ve bütçe giriniz");
      return;
    }
    try {
      await customerService.createPremiumCustomer(
        newCustomer.customerName,
        Number(newCustomer.budget)
      );
      fetchCustomers();
      setNewCustomer({
        customerName: "",
        budget: "",
        customerType: "Standard",
      });
      alert("Premium müşteri başarıyla eklendi");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreate = async () => {
    if (!newCustomer.customerName || !newCustomer.budget) {
      alert("Lütfen müşteri adı ve bütçe giriniz");
      return;
    }
    try {
      await customerService.createCustomer({
        customerName: newCustomer.customerName,
        budget: Number(newCustomer.budget),
        customerType: newCustomer.customerType,
      });
      fetchCustomers();
      setNewCustomer({
        customerName: "",
        budget: "",
        customerType: "Standard",
      });
      alert("Müşteri başarıyla eklendi");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      customerName: customer.customerName,
      budget: customer.budget,
      customerType: customer.customerType,
    });
  };

  const handleUpdate = async () => {
    if (!editingCustomer) return;

    try {
      await customerService.updateCustomer(editingCustomer.customerID, {
        customerName: newCustomer.customerName,
        budget: Number(newCustomer.budget),
        customerType: newCustomer.customerType,
      });

      fetchCustomers();
      setEditingCustomer(null);
      setNewCustomer({
        customerName: "",
        budget: "",
        customerType: "Standard",
      });
      alert("Müşteri başarıyla güncellendi");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
      try {
        await customerService.deleteCustomer(id);
        fetchCustomers();
        alert("Müşteri başarıyla silindi");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleCancel = () => {
    setEditingCustomer(null);
    setNewCustomer({ customerName: "", budget: "", customerType: "Standard" });
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <CustomersContainer>
      <Title onClick={() => setIsContentVisible(!isContentVisible)}>
        Müşteri Yönetimi {isContentVisible ? "▼" : "▲"}
      </Title>
      <ContentContainer isVisible={isContentVisible}>
        <div>
          <FormGroup>
            <Label>Müşteri Adı</Label>
            <Input
              type="text"
              name="customerName"
              value={newCustomer.customerName}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Bütçe</Label>
            <Input
              type="number"
              name="budget"
              value={newCustomer.budget}
              onChange={handleInputChange}
              min="0"
            />
          </FormGroup>
          {editingCustomer ? (
            <ButtonGroup>
              <AddButton onClick={handleUpdate}>Güncelle</AddButton>
              <Button onClick={handleCancel}>İptal</Button>
            </ButtonGroup>
          ) : (
            <ButtonGroup>
              <AddButton onClick={handleCreateStandard}>
                Standart Müşteri Ekle
              </AddButton>
              <AddButton onClick={handleCreatePremium}>
                Premium Müşteri Ekle
              </AddButton>
              <AddButton onClick={handleCreate}>Normal Müşteri Ekle</AddButton>
            </ButtonGroup>
          )}
        </div>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Müşteri Adı</Th>
                <Th>Bütçe</Th>
                <Th>Müşteri Tipi</Th>
                <Th>İşlemler</Th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={index}>
                  <Td>{customer.customerName}</Td>
                  <Td>{customer.budget.toLocaleString("tr-TR")} ₺</Td>
                  <Td>
                    <CustomerTypeBadge type={customer.customerType}>
                      {customer.customerType}
                    </CustomerTypeBadge>
                  </Td>
                  <Td>
                    <ActionButtons>
                      <EditButton onClick={() => handleEdit(customer)}>
                        <FiEdit size={16} />
                      </EditButton>
                      <DeleteButton
                        onClick={() => handleDelete(customer.customerID)}
                      >
                        <RiDeleteBinLine size={16} />
                      </DeleteButton>
                    </ActionButtons>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </ContentContainer>
    </CustomersContainer>
  );
};

export default Customers;
