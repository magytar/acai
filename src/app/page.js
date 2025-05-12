'use client';

import { useState, useEffect } from 'react';
import './style.css';

import Image from "next/image"

import Copo2 from "./imgs/copo2.webp"
import Copo3 from "./imgs/copo3.jpg"
import Copo4 from "./imgs/copo4.jpg"
import Copo5 from "./imgs/copo5.jpg"
import Copo6 from "./imgs/copo6.jpg"

export default function AcaiStore() {
  // Produtos de açaí
  const [errorcep, seterrorcep] = useState(false)
  
  const acaiProducts = [
    {
      id: 1,
      name: 'Combo 2 Copo De Açaí 300Ml',
      description: 'Acompanha Nuttela, Frutas, Grenola e Leite Condensado',
      price: 14.90,
      size: '500ml',
      image: Copo4,
    },
    {
      id: 2,
      name: 'Combo 2 Copo De Açaí 400Ml',
      description: 'Acompanha Nuttela, Frutas, Grenola e Leite Condensado + cookie chocolate branco',
      price: 18.90,
      size: '400ml',
      image: Copo3,
    },
    {
      id: 3,
      name: 'Combo 2 Copo De Açaí 700Ml',
      description: 'Acompanha Nuttela, Frutas, Grenola e Leite Condensado',
      price: 24.90,
      size: '700ml',
      image: Copo2,
    },
    {
      id: 4,
      name: 'Combo 2 Copo De Açaí 500Ml',
      description: 'Acompanha Nuttela, Frutas, Grenola e Leite Condensado',
      price: 22.90,
      size: '500ml',
      image: Copo5,
    },
    {
      id: 5,
      name: 'Combo 2 Copo De Açaí 500Ml, apenas primeiro pedido',
      description: 'Acompanha Nuttela, Frutas, Grenola e Leite Condensado',
      price: 19.90,
      size: '500ml',
      image: Copo6,
    },
  ];

  // Estado para o carrinho de compras
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Carregar carrinho do localStorage quando o componente montar
  useEffect(() => {
    const savedCart = localStorage.getItem('acaiCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);
  
  // Salvar carrinho no localStorage quando for atualizado
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('acaiCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Funções para manipular o carrinho
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Verificar se o produto já está no carrinho
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Se o produto já existe, aumentar a quantidade
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Se o produto não existe, adicionar ao carrinho
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    
    // Abrir o carrinho automaticamente ao adicionar um item
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.id !== productId)
    );
    
    // Se o carrinho ficar vazio após a remoção, atualize o localStorage
    if (cartItems.length === 1) {
      localStorage.removeItem('acaiCart');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  // Calcular o total do carrinho
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Abrir/fechar o carrinho
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Finalizar a compra
  const checkout = async () => {
    setCartItems([]);
    localStorage.removeItem('acaiCart');
    setIsCartOpen(false);

    const total = calculateTotal().toFixed(2)
    
    try {
      // Chamar a API selecionada
      const response = await fetch("./api", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Marcha Açaí',
          price: total,
          quantity: 1,
          description: 'Copo De Açaí'
        }),
      });

      const data = await response.json();
      
      console.log('Resposta da API:', data);
      
      // Salvar a resposta para debug

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro ao processar pagamento');
      }

      // Se estamos em modo debug, não redireciona
      // Ver se temos qualquer URL de checkout disponível
      const checkoutUrl = data.checkout_url || data.sandbox_url;
      
      if (!checkoutUrl) {
        console.error('Detalhes da resposta da API sem URL de checkout:', data);
        throw new Error('URL de checkout não disponível. Verifique o console para mais detalhes.');
      }

      console.log('Redirecionando para:', checkoutUrl);
      
      // Redirecionar para o checkout do Mercado Pago
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err.message || 'Ocorreu um erro ao processar a requisição');
    } finally {
      setIsLoading(false);
    }

  };

  const [perguntar, setperguntar] = useState(true)
  const [cep, setCep] = useState("")
  const [cidade, setCidade] = useState("")
  const [bairro, setBairro] = useState("")
  const [numero, setNumero] = useState("")

  async function consulta() {
    try {
      fetch("https://viacep.com.br/ws/" + cep + "/json/")
      .then((res)=>{
        return res.json()
      })
      .then((data) => {
        setCep(data.cep)
        setCidade(data.localidade)
        setBairro(data.bairro)
        setperguntar(false)
      })
      .catch(()=>{
        setperguntar(true)
        seterrorcep(true)
      })
    }
    catch {
      console.log("error")
    }
  }

  return (
    <div className="acai-store">
      {perguntar ? (
        <div className='pergunta'> 
          <h2>Consulta de Endereço</h2>
    
          <div class="input-group">
            <label for="cep">CEP</label>
            <input id="cep" type="text" placeholder="Digite seu CEP" maxlength="9" value={cep} onChange={(e) => setCep(e.target.value)}/>
          </div>
          
          <div class="input-group">
            <label for="numero">Número</label>
            <input id="numero" type="text" placeholder="Digite o número" value={numero} onChange={(e) => setNumero(e.target.value)}/>
          </div>
          
          <button id="btnEnviar" onClick={consulta}>Buscar Endereço</button>
          {errorcep ? (
            <p>CEP NÃO EXISTE</p>
          ):(
            <></>
          )}
        </div>
      ):(
        <></>
      )}
      <header className="header">
        <div className="logo">
          <h1>Açaí Delícia</h1>
        </div>
        <button className="cart-button" onClick={toggleCart}>
          🛒 Carrinho ({cartItems.reduce((total, item) => total + item.quantity, 0)})
        </button>
          {cidade != "" ? (
            <h3>{cidade} {bairro} {numero}</h3>
          ): (<></>)}
      </header>

      <main>
        <section className="hero">
          <h2>Os melhores açaís da cidade!</h2>
          <p>Experimente nossos deliciosos açaís preparados com frutas frescas</p>
        </section>
        
        <section className="products">
          <h2>Cardápio</h2>
          <div className="product-grid">
            {acaiProducts.map(product => (
              <div key={product.id} className="product-card">
                <Image src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <h3>-50%</h3>
                  <p className="product-description">{product.description}</p>
                  <p className="product-size">Tamanho: {product.size}</p>
                  <p className="product-size">Frete: R$0,00 Primeira Compra</p>
                  <p className="product-price">R$ {product.price.toFixed(2)}</p>
                  <button 
                    className="add-to-cart-button"
                    onClick={() => addToCart(product)}
                  >
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Carrinho de compras */}
      {isCartOpen && (
        <div className="cart-overlay">
          <div className="cart-content">
            <div className="cart-header">
              <h2>Seu Carrinho</h2>
              <button className="close-button" onClick={toggleCart}>×</button>
            </div>
            
            {cartItems.length === 0 ? (
              <p className="empty-cart">Seu carrinho está vazio</p>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <Image src={Copo2} alt={item.name} className="cart-item-image" />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p>R$ {item.price.toFixed(2)}</p>
                      </div>
                      <div className="cart-item-actions">
                        <button 
                          className="quantity-button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="item-quantity">{item.quantity}</span>
                        <button 
                          className="quantity-button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="remove-button"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="cart-summary">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                  <button className="checkout-button" onClick={checkout}>
                    Finalizar Compra
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <footer className="footer">
        <p>&copy; 2025 Açaí Delícia - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}