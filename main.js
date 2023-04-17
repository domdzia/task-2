const usersData = [];
const products = [];
const carts = [];
const availableCategories = [];

async function getUserData() {
  try {
    const respone = await fetch("https://fakestoreapi.com/users");
    const data = await respone.json();
    data.forEach((elem) => {
      usersData.push({
        id: elem.id,
        email: elem.email,
        username: elem.username,
        password: elem.password,
        name: elem.name,
        phone: elem.phone,
        address: elem.address,
        geolocation: elem.address.geolocation,
      });
    });
  } catch (error) {
    console.log(error);
  }
}

async function getProductsData() {
  try {
    const respone = await fetch("https://fakestoreapi.com/products");
    const data = await respone.json();
    data.forEach((prod) => {
      products.push({
        id: prod.id,
        title: prod.title,
        price: prod.price,
        description: prod.description,
        category: prod.category,
        img: prod.image,
        raiting: prod.raiting,
      });
    });
  } catch (error) {
    console.log(error);
  }
}

async function getCartsData() {
  try {
    const respone = await fetch(
      "https://fakestoreapi.com/carts/?startdate=2000-01-01&enddate=2023-04-07"
    );
    const data = await respone.json();
    data.forEach((cart) => {
      carts.push({
        id: cart.id,
        userID: cart.userId,
        date: cart.date,
        products: cart.products,
      });
    });
  } catch (error) {
    console.log(error);
  }
}

getUserData().then(() => {
  let highestValue = 0;
  let result = "";
  for (let i = 0; i < usersData.length - 1; i++) {
    const firstLatValue = usersData[i].address.geolocation["lat"];
    const secondLatValue = usersData[i + 1].address.geolocation["lat"];
    const firstLongValue = usersData[i].address.geolocation["long"];
    const secondLongValue = usersData[i + 1].address.geolocation["long"];

    const R = 6371e3; // metres
    const φ1 = (firstLatValue * Math.PI) / 180;
    const φ2 = (secondLatValue * Math.PI) / 180;
    const Δφ = ((secondLatValue - firstLatValue) * Math.PI) / 180;
    const Δλ = ((secondLongValue - firstLongValue) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    const km = d / 1000;

    if (km > highestValue) {
      highestValue = km;
      result = `Two users living furthest away from each other is: ${
        usersData[i].name.firstname
      } ${usersData[i].name.lastname} (id:${usersData[i].id}) and ${
        usersData[i + 1].name.firstname
      } ${usersData[i + 1].name.lastname} (id:${
        usersData[i + 1].id
      }), the distance beetwen them is ${highestValue.toFixed(2)}km`;
    }
  }

  return result;
});

getProductsData().then(() => {
  products.forEach((prod) => {
    const category = prod.category;
    const price = prod.price;

    if (!availableCategories[category]) {
      availableCategories[category] = 0;
    }
    availableCategories[category] += price;
  });
  return availableCategories;
});

getCartsData().then(() => {
  let highestValue = 0;
  let cartId;
  carts.forEach((cart) => {
    let value = 0;
    cart.products.forEach((elem) => {
      const cartProductId = elem.productId;
      const productQuantity = elem.quantity;
      const sameIdProduct = products.filter(
        (prod) => prod.id === cartProductId
      );
      sameIdProduct.forEach((prod) => {
        value += prod.price * productQuantity;
      });
      if (value > highestValue) {
        highestValue = value;
        cartId = cart.id;
      }
    });
  });

  const filteredObject = usersData.filter((user) => user.id === cartId);
  const userName = filteredObject.map(
    (user) => `${user.name.firstname} ${user.name.lastname}`
  );

  const userNameStr = userName.join(" ");
  const result = `The highest value of card is ${highestValue} and owner of this cart is ${userNameStr}`;

  return result;
});
