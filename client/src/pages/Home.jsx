import React, { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import Card from 'react-bootstrap/Card';
import { useSelector, useDispatch } from 'react-redux';
import { FaConciergeBell } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Redux slices
import { fetchCart, addItemServer } from '../redux/slices/cartSlice';
import { fetchMenus, selectMenus, selectMenusLoading } from '../redux/slices/menuSlice';
import { getCategories } from '../helpers/category';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const categories = getCategories();
  const user = useSelector(state => state.user.user);
  //console.log(user);
  
  const menus = useSelector(selectMenus);
  //console.log(menus)
  const loadingMenus = useSelector(selectMenusLoading);

  const topPicks = menus.filter(m => m.isToppick);

  const cart = useSelector(state => state.cart);
  const adding = cart.loading;

  useEffect(() => {
  dispatch(fetchMenus());

  const loadCart = async () => {
    if (user && (user.id || user._id)) {
      try {
        await dispatch(fetchCart()).unwrap();
      } catch (e) {
      }
    }
  };

  loadCart();
}, [dispatch, user]);

  const handleAddToCart = async (menu) => {
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/');
      return;
    }

    try {
      await dispatch(addItemServer({ menuId: menu._id, qty: 1, type: 'takeaway' })).unwrap();
      toast.success(`${menu.name} added to cart`);
    } catch (err) {
      console.error('Add to cart failed', err);
      toast.error(err || 'Failed to add to cart');
    }
  };

  return (
    <>
 
      <Carousel>
        <Carousel.Item>
          <img className="d-block w-100 img-fluid" src="banner1.jpg" alt="First slide" />
          <Carousel.Caption>
            <h2 className='text-white'>Delicious Meals Delivered</h2>
            <p className='text-white'>Get your favorite dishes delivered hot & fresh to your door.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img className="d-block w-100 h-30 img-fluid" src="banner2.jpg" alt="Second slide" />
          <Carousel.Caption>
            <h2 className='text-black'>Lightning-Fast Delivery</h2>
            <p className='text-black'>Enjoy food in under 30 minutes.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img className="d-block w-100 h-30 img-fluid" src="banner3.jpg" alt="Third slide" />
          <Carousel.Caption>
            <h2 className='text-black'>Explore 100+ Food Options</h2>
            <p className='text-black'>From pizza to biryani – there’s something for everyone on Tastique.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <Container className='mt-4'>
        <Row>
          <Col className='mb-5'>
            <Card style={{ width: '20rem', height: '23rem' }}>
              <Card.Img variant="top" src="card1.webp" />
              <Card.Body>
                <Card.Title>🍽️ Delicious Variety</Card.Title>
                <Card.Text>
                  From sizzling street food to gourmet delights, Tastique serves every craving with a rich menu across multiple cuisines.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col className='mb-5'>
            <Card style={{ width: '20rem', height: '23rem' }}>
              <Card.Img variant="top" src="card2.jpeg" />
              <Card.Body>
                <Card.Title>🕒 Fast & Fresh Delivery</Card.Title>
                <Card.Text>
                  We ensure your food reaches you piping hot and on time, every single time.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col className='mb-5'>
            <Card style={{ width: '20rem', height: '23rem' }}>
              <Card.Img variant="top" src="card3.webp" />
              <Card.Body>
                <Card.Title>👨‍🍳 Curated by Food Experts</Card.Title>
                <Card.Text>
                  Every dish is quality-checked and chef-approved to deliver consistent taste and hygiene.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Container>
        <Row>
          <h3 className='pb-3 text-center'>Explore Our Categories</h3>
          {categories.map((cat, index) => (
            <Col key={index} md={2} sm={3} lg={1} xs={3} className='m-2'>
              <Card className="text-center border-0 shadow-sm" style={{ width: '100px' }}>
                <Card.Img variant="top" src={cat.image} style={{ height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <Card.Body className="p-2">
                  <Card.Title as="h6" className="mb-0" style={{ fontSize: '0.9rem' }}>
                    <Link to={`/category/${cat.title}`} className="text-decoration-none text-dark">
                      {cat.title}
                    </Link>
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="mt-3 mb-5">
        <h3 className="pb-3 text-center">Top Picks Near You</h3>

        {loadingMenus ? (
          <div className="text-center text-muted">Loading menus...</div>
        ) : topPicks.length === 0 ? (
          <div className='text-center'>
            <FaConciergeBell size={80} color="gray" className="mb-4" />
            <h3 className="text-muted">No Top Picks Available</h3>
            <p className="text-secondary">We’re curating the best dishes for you. Check back soon!</p>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {topPicks.map(menu => (
              <Col key={menu._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={menu.image}
                    style={{ height: '160px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{menu.name}</Card.Title>
                    <Card.Text>{menu.description}</Card.Text>
                    <Card.Text>₹{menu.price}</Card.Text>
                    <Button
                      variant="danger"
                      disabled={adding}
                      onClick={() => handleAddToCart(menu)}
                    >
                      {adding ? 'Adding...' : 'Add To Cart'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
}

export default Home;
