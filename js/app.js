let products = [];

function productItem(product) {
  const dolarConversion = 5.50;
  const name = product.name;
  const imgUrl = product.api_featured_image;
  const price = product.price;//String(value / 100).replace('.',',')
  const priceFormated = price ? `R$ ${String(((price * dolarConversion) / 100).toFixed(2)).replace('.',',')}` : 'R$ 0,00';
  const brand = product.brand;
  const category = product.category
  const producId = product.id;
  const productType = product.product_type;
  const rating = product.rating || ' ';

  return `<div class="product" data-name="${name}" data-brand="${brand}" data-type="${category}" tabindex="${producId}">
    <figure class="product-figure">
      <img src="${imgUrl}" width="215" height="215" alt="${name}" onerror="javascript:this.src='img/unavailable.png'">
    </figure>
    <section class="product-description">
      <h1 class="product-name">${name}</h1>
      <div class="product-brands">
        <span class="product-brand background-brand">${brand}</span>
        <span class="product-brand background-price">${priceFormated}</span>
      </div>
    </section>
    <section class="product-details">
    <div class="details-row">
      <div>Brand</div>
      <div class="details-bar">
        <div class="details-bar-bg">${brand}</div>
      </div>
    </div>
    <div class="details-row">
      <div>Price</div>
      <div class="details-bar">
        <div class="details-bar-bg">${priceFormated}</div>
      </div>
    </div>
    <div class="details-row">
      <div>Rating</div>
      <div class="details-bar">
        <div class="details-bar-bg">${rating}</div>
      </div>
    </div>
    <div class="details-row">
      <div>Category</div>
      <div class="details-bar">
        <div class="details-bar-bg">${category}</div>
      </div>
    </div>
    <div class="details-row">
      <div>Product_type</div>
      <div class="details-bar">
        <div class="details-bar-bg">${productType}</div>
      </div>
    </div>
  </section>
  </div>`;
}

async function doRequest(endPoint) {
  const fetchResponce = await fetch(endPoint).then((response) => {
    if(response.status >= 400 && response.status < 600) {
      console.warn(response.status);
      return null;
    }
    return response;
  }).catch((error) => {
    console.warn(error);
  });

  console.log(fetchResponce);

  return fetchResponce ? await fetchResponce.json() : null;
}

function filterNameChange(event) {
  const filteredProducts = products.filter((value, index, self) => value.name.toLowerCase().includes(event.target.value.toLowerCase()));

  let productsHtml = '';
  for(let product of filteredProducts) {
    productsHtml += productItem(product);
  }
  
  document.querySelector('.catalog').innerHTML = productsHtml;
}

async function filterBrandTypeChange(event) {
  const brand = document.querySelector('#filter-brand').value;
  const type = document.querySelector('#filter-type').value;

  console.log(brand, type);

  let url = (brand ? `brand=${brand}` : '') + (brand && type ? '&' : '') + (type ? `product_type=${type}` : '');

  products = await doRequest('https://makeup-api.herokuapp.com/api/v1/products.json' + (url ? `?${url}` : ''));

  const sortType = document.querySelector('#sort-type').value;
console.log(url, products);
  sortProducts(sortType);
}

function sortProducts(sortProperty) {
  const sortObjects = {
    'melhorAvaliados': (a, b) => b.rating - a.rating,
    'menoresPrecos': (a, b) => Number(a.price) - Number(b.price),
    'maioresPrecos': (a, b) => Number(b.price) - Number(a.price),
    'a-z': (a, b) => {
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      if (x < y) {return -1;}
      if (x > y) {return 1;}
      return 0;
    },
    'z-a': (a, b) => {
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      if (x > y) {return -1;}
      if (x < y) {return 1;}
      return 0;
    }
  };

  const sortType = sortObjects[sortProperty];
  
  products.sort(sortType);

  let productsHtml = '';
  for(let product of products) {
    productsHtml += productItem(product);
  }

  document.querySelector('.catalog').innerHTML = productsHtml;  
}

function sortTypeChange(event) {
  sortProducts(event.target.value);
}

async function init() {
  //endpoint 'https://makeup-api.herokuapp.com/api/v1/products.json'
  //local '/data/products.json'
  products = await doRequest('data/products.json');

  console.log(products);

  products.sort(( a, b ) => b.rating - a.rating);

  let productsHtml = '';
  for(let product of products) {
    productsHtml += productItem(product);
  }

  document.querySelector('.catalog').innerHTML = productsHtml;

  const brands = products.map(product => product.brand).filter((value, index, self) => value && self.indexOf(value) === index);
  const filterBrand = document.querySelector('#filter-brand');
  filterBrand.innerHTML = filterBrand.innerHTML + brands.map(brand => `<option value="${brand}">${brand}</option>`);
  filterBrand.addEventListener('change', filterBrandTypeChange);

  const types = products.map(product => product.product_type).filter((value, index, self) => value && self.indexOf(value) === index);
  const filterType = document.querySelector('#filter-type');
  filterType.innerHTML = filterType.innerHTML + types.map(type => `<option value="${type}">${type}</option>`);
  filterType.addEventListener('change', filterBrandTypeChange);

  document.querySelector('#filter-name').addEventListener('keyup', filterNameChange);

  document.querySelector('#sort-type').addEventListener('change', sortTypeChange);

  document.querySelector('#sort-type').addEventListener('change', sortTypeChange);
}