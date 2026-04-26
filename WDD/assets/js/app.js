(function(){
  const SEED_PRODUCTS = [
    {id:'beige-satin-slip-dress',name:'Beige Satin Slip Dress',price:2960,image:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'],description:'Smooth satin drape with a flattering neckline for elegant evenings.',gender:'Women',type:'Dress',sizes:['XS','S','M','L'],colors:['Beige']},
    {id:'black-lace-blouse',name:'Black Lace Blouse',price:2080,image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80'],description:'Detailed lace design with structured silhouette for day-to-night styling.',gender:'Women',type:'Top',sizes:['S','M','L'],colors:['Black']},
    {id:'red-wrap-midi-dress',name:'Red Wrap Midi Dress',price:3120,image:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80'],description:'Confident wrap fit in a rich red tone with fluid movement.',gender:'Women',type:'Dress',sizes:['S','M','L'],colors:['Red']},
    {id:'camel-double-breasted-blazer',name:'Camel Double-Breasted Blazer',price:3200,image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'],description:'Tailored camel blazer for polished office and casual looks.',gender:'Women',type:'Blazer',sizes:['S','M','L'],colors:['Camel']},
    {id:'ruched-satin-mini-dress',name:'Ruched Satin Mini Dress',price:2690,image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80'],description:'Soft sheen mini dress with ruching details and fitted shape.',gender:'Women',type:'Dress',sizes:['XS','S','M'],colors:['Champagne']},
    {id:'women-ivory-knit-top',name:'Ivory Knit Top',price:2240,image:'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80'],description:'Lightweight knit top with soft texture for all-day comfort.',gender:'Women',type:'Top',sizes:['XS','S','M','L'],colors:['Ivory']},
    {id:'women-pleated-maxi-skirt',name:'Pleated Maxi Skirt',price:2560,image:'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1200&q=80'],description:'Flowy pleated skirt with elegant movement and modern cut.',gender:'Women',type:'Skirt',sizes:['S','M','L'],colors:['Rose','Black']},
    {id:'women-denim-midi-skirt',name:'Denim Midi Skirt',price:2380,image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'],description:'Structured denim midi skirt with a clean front slit and easy styling.',gender:'Women',type:'Skirt',sizes:['XS','S','M','L'],colors:['Indigo']},
    {id:'women-cropped-denim-jacket',name:'Cropped Denim Jacket',price:2830,image:'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80'],description:'A cropped denim layer for effortless weekend styling.',gender:'Women',type:'Jacket',sizes:['S','M','L'],colors:['Blue']},
    {id:'women-tailored-trouser',name:'Tailored High-Rise Trouser',price:2930,image:'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=80'],description:'High-rise tailored trouser built for office and evening wear.',gender:'Women',type:'Pants',sizes:['26','28','30','32'],colors:['Charcoal']},
    {id:'women-floral-wrap-top',name:'Floral Wrap Top',price:2380,image:'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80'],description:'Soft floral wrap top with flattering neckline and lightweight drape.',gender:'Women',type:'Top',sizes:['XS','S','M','L'],colors:['Floral']},
    {id:'women-charcoal-coat',name:'Women Charcoal Coat',price:4790,image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'],description:'Longline charcoal coat tailored for clean structure and warmth.',gender:'Women',type:'Coat',sizes:['S','M','L'],colors:['Charcoal']},
    {id:'women-satin-shirt',name:'Women Satin Shirt',price:2530,image:'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=80'],description:'Silky satin shirt for elevated day-to-evening styling.',gender:'Women',type:'Shirt',sizes:['S','M','L'],colors:['Pearl']},
    {id:'women-hooded-sweat',name:'Women Hooded Sweatshirt',price:2220,image:'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80'],description:'Relaxed hooded sweatshirt with soft lining and tapered cuff.',gender:'Women',type:'Sweatshirt',sizes:['S','M','L','XL'],colors:['Mauve']},

    {id:'mens-oxford-shirt',name:'Men Oxford Shirt',price:2300,image:'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80'],description:'Crisp cotton oxford shirt designed for office and smart casual wear.',gender:'Men',type:'Shirt',sizes:['S','M','L','XL'],colors:['White','Blue']},
    {id:'mens-slim-chinos',name:'Men Slim Chinos',price:2430,image:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80'],description:'Stretch slim-fit chinos with all-day comfort and clean silhouette.',gender:'Men',type:'Pants',sizes:['30','32','34','36'],colors:['Khaki','Navy']},
    {id:'mens-bomber-jacket',name:'Men Bomber Jacket',price:3520,image:'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1200&q=80'],description:'Lightweight bomber jacket with ribbed collar and modern fit.',gender:'Men',type:'Jacket',sizes:['M','L','XL'],colors:['Olive','Black']},
    {id:'mens-linen-casual-shirt',name:'Men Linen Casual Shirt',price:2160,image:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80'],description:'Breathable linen shirt ideal for summer layering and travel.',gender:'Men',type:'Shirt',sizes:['S','M','L','XL'],colors:['Sage','White']},
    {id:'mens-crew-neck-tee',name:'Men Crew Neck Tee',price:1500,image:'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1200&q=80'],description:'Essential premium tee with clean neckline and soft handfeel.',gender:'Men',type:'Top',sizes:['S','M','L','XL'],colors:['Black','White']},
    {id:'mens-wool-overcoat',name:'Men Wool Overcoat',price:4550,image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80'],description:'Structured wool overcoat for a refined winter silhouette.',gender:'Men',type:'Coat',sizes:['M','L','XL'],colors:['Camel','Black']},
    {id:'mens-athletic-jogger',name:'Men Athletic Jogger',price:1980,image:'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80'],description:'Tapered jogger with stretch fabric for movement and comfort.',gender:'Men',type:'Pants',sizes:['S','M','L','XL'],colors:['Graphite']},
    {id:'mens-striped-polo',name:'Men Striped Polo',price:1840,image:'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80'],description:'Classic striped polo with a sporty, polished finish.',gender:'Men',type:'Top',sizes:['S','M','L','XL'],colors:['Navy','White']},
    {id:'mens-denim-trucker',name:'Men Denim Trucker',price:3040,image:'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1200&q=80'],description:'Rugged denim trucker jacket with timeless everyday appeal.',gender:'Men',type:'Jacket',sizes:['M','L','XL'],colors:['Indigo']},
    {id:'mens-grey-blazer',name:'Men Grey Blazer',price:4100,image:'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1400&q=80',images:['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1400&q=80'],description:'Slim structured blazer with refined lapel and modern fit.',gender:'Men',type:'Blazer',sizes:['M','L','XL'],colors:['Grey']},
    {id:'mens-overshirt-khaki',name:'Men Khaki Overshirt',price:2670,image:'https://images.unsplash.com/photo-1506629905607-c5f5f9a6f6d0?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1506629905607-c5f5f9a6f6d0?auto=format&fit=crop&w=1200&q=80'],description:'Midweight overshirt for transitional weather layering.',gender:'Men',type:'Shirt',sizes:['S','M','L','XL'],colors:['Khaki']},
    {id:'mens-tailored-shorts',name:'Men Tailored Shorts',price:1900,image:'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80'],description:'Smart tailored shorts for polished warm-weather outfits.',gender:'Men',type:'Shorts',sizes:['30','32','34','36'],colors:['Stone']},

    {id:'denim-jacket',name:'Denim Jacket',price:2510,image:'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80'],description:'Classic denim jacket with a versatile wash and all-gender fit.',gender:'Unisex',type:'Jacket',sizes:['S','M','L','XL'],colors:['Blue']},
    {id:'women-cozy-hoodie',name:'Women Cozy Hoodie',price:2190,image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN9MRwLKEF4Dep7a1j6yX__TSW9Iteach84g&s',images:['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN9MRwLKEF4Dep7a1j6yX__TSW9Iteach84g&s'],description:'Soft fleece hoodie with a relaxed fit for everyday comfort.',gender:'Women',type:'Hoodie',sizes:['S','M','L','XL'],colors:['Light Grey']},
    {id:'men-classic-hoodie',name:'Men Classic Hoodie',price:2250,image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqW3nVBS5FeGQsuXZh9ZhovG6pcfNCuDy2XA&s',images:['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqW3nVBS5FeGQsuXZh9ZhovG6pcfNCuDy2XA&s'],description:'Classic pullover hoodie with clean lines and easy layering.',gender:'Men',type:'Hoodie',sizes:['S','M','L','XL'],colors:['Taupe']},
    {id:'unisex-graphic-zip-hoodie',name:'Unisex Graphic Zip Hoodie',price:2390,image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7sX3ofPOK5wuKBE8IcqzRWA6rq2AxlQOTcQ&s',images:['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7sX3ofPOK5wuKBE8IcqzRWA6rq2AxlQOTcQ&s'],description:'Statement zip hoodie with bold graphic print and roomy fit.',gender:'Unisex',type:'Hoodie',sizes:['S','M','L','XL'],colors:['Black']},
    {id:'unisex-oversized-tee',name:'Unisex Oversized Tee',price:1630,image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'],description:'Boxy oversized t-shirt built for street-ready layering.',gender:'Unisex',type:'Top',sizes:['S','M','L','XL'],colors:['Stone','Black']},
    {id:'unisex-cargo-pants',name:'Unisex Cargo Pants',price:2640,image:'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=1200&q=80'],description:'Utility cargo pants with roomy pockets and tapered leg.',gender:'Unisex',type:'Pants',sizes:['S','M','L','XL'],colors:['Olive','Sand']},
    {id:'unisex-quarter-zip',name:'Unisex Quarter Zip Sweatshirt',price:2350,image:'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80'],description:'Clean quarter-zip sweatshirt with soft fleece interior.',gender:'Unisex',type:'Sweatshirt',sizes:['S','M','L','XL'],colors:['Cream','Black']},
    {id:'unisex-tech-runner-jacket',name:'Unisex Tech Runner Jacket',price:3140,image:'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1200&q=80'],description:'Lightweight technical layer with wind-resistant finish.',gender:'Unisex',type:'Jacket',sizes:['S','M','L','XL'],colors:['Slate']},
    {id:'unisex-relaxed-shorts',name:'Unisex Relaxed Shorts',price:1770,image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'],description:'Relaxed shorts with minimal look and easy everyday comfort.',gender:'Unisex',type:'Shorts',sizes:['S','M','L','XL'],colors:['Sand','Black']},
    {id:'unisex-minimal-co-ord',name:'Unisex Minimal Co-ord Set',price:3730,image:'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80'],description:'Matching co-ord set with relaxed silhouette and clean lines.',gender:'Unisex',type:'Set',sizes:['S','M','L'],colors:['Taupe']},
    {id:'women-lounge-co-ord',name:'Women Lounge Co-ord Set',price:3450,image:'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80'],description:'Soft lounge co-ord set with relaxed top and easy jogger.',gender:'Women',type:'Set',sizes:['S','M','L','XL'],colors:['Mauve']},
    {id:'unisex-street-bomber',name:'Unisex Street Bomber',price:3890,image:'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80'],description:'Statement bomber jacket with structured shoulders and comfort.',gender:'Unisex',type:'Jacket',sizes:['S','M','L','XL'],colors:['Black','Burgundy']},
    {id:'unisex-utility-shirt',name:'Unisex Utility Shirt',price:2400,image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80'],description:'Utility-inspired shirt with patch pockets and relaxed fit.',gender:'Unisex',type:'Shirt',sizes:['S','M','L','XL'],colors:['Olive']},
    {id:'unisex-longline-coat',name:'Unisex Longline Coat',price:5000,image:'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80',images:['https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80'],description:'Clean longline coat with minimalist detailing and warmth.',gender:'Unisex',type:'Coat',sizes:['S','M','L','XL'],colors:['Black']},
    {id:'unisex-knit-polo',name:'Unisex Knit Polo',price:2110,image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80',images:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80'],description:'Soft-knit polo for smart-casual everyday looks.',gender:'Unisex',type:'Top',sizes:['S','M','L','XL'],colors:['Charcoal']},
    {id:'unisex-relaxed-blazer',name:'Unisex Relaxed Blazer',price:3750,image:'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1400&q=80',images:['https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1400&q=80'],description:'Relaxed blazer with soft shoulder and contemporary drape.',gender:'Unisex',type:'Blazer',sizes:['S','M','L','XL'],colors:['Taupe']},
    {id:'unisex-lightweight-windbreaker',name:'Unisex Lightweight Windbreaker',price:2960,image:'https://images.unsplash.com/photo-1467043237213-65f2da53396f?auto=format&fit=crop&w=1400&q=80',images:['https://images.unsplash.com/photo-1467043237213-65f2da53396f?auto=format&fit=crop&w=1400&q=80'],description:'Packable windbreaker with lightweight fabric and sporty finish.',gender:'Unisex',type:'Jacket',sizes:['S','M','L','XL'],colors:['Graphite']},
    {id:'unisex-knit-joggers',name:'Unisex Knit Joggers',price:2160,image:'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80',images:['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80'],description:'Comfort knit joggers with tapered leg and soft waistband.',gender:'Unisex',type:'Pants',sizes:['S','M','L','XL'],colors:['Grey','Black']}
  ];
  const IMAGE_OVERRIDES = {
    'beige-satin-slip-dress':'https://cdnb.lystit.com/photos/4fe2-2014/09/08/hanro-beige-satin-deluxe-slip-dress-product-1-23355596-0-057328926-normal.jpeg',
    'black-lace-blouse':'https://i1.adis.ws/i/truworths/prod3126894_1.jpeg',
    'camel-double-breasted-blazer':'https://anninc.scene7.com/is/image/AN/838238_5824?$pdpzoom$',
    'denim-jacket':'https://www.outfittrends.com/wp-content/uploads/2017/02/pattern-denim-jacket2pg.jpg',
    'men-casual-oversized-hoodie':'https://i5.walmartimages.com/seo/Xyxonk-Zip-Up-Hoodie-Men-Plus-Size-Half-Zipper-Hoodies-Pockets-Fashion-Multiple-Zippers-Basic-Sweatshirt-Military-Warm-Drawstring-4X-5X-Pullover-Blac_f148946d-4e78-4493-89f9-f7327d419488.259c545d74e40da47a33aeabe8afe0c5.jpeg',
    'men-classic-hoodie':'https://cdna.lystit.com/photos/boohooman/a3624f80/boohooman-designer-black-Bonded-Scuba-Oversized-Hoodie.jpeg',
    'men-classic-trench-coat':'https://i.pinimg.com/originals/e2/3d/ac/e23dac961decf1157fdb1af42bd20b7f.jpg',
    'men-cotton-polo-shirt':'https://i5.walmartimages.com/seo/DDAPJ-pyju-Men-s-Long-Sleeve-Polos-Shirt-Pocket-Lightweight-Button-Cotton-T-shirt-Regular-Fit-Work-Office-Shirts-Solid-Basic-Undershirt-Blazer-Coat-J_62f3aba8-f721-4156-a3e2-c2be13bc6ba8.2269a4762840fb4c58a9f81e26e6aba0.jpeg',
    'men-formal-waistcoat':'https://i.pinimg.com/originals/d6/da/55/d6da55b9c3249ecf0e21bf0fc9afc99b.jpg',
    'men-knit-crew-sweater':'https://i.pinimg.com/originals/d1/e5/c9/d1e5c98f11adf7f6ce19ed13f3931739.jpg',
    'mens-athletic-jogger':'https://i5.walmartimages.com/asr/b19e1c15-c68c-4e48-a082-a08b55a5d7c9.59207cc97881becb12a233982a5f99f0.jpeg',
    'mens-bomber-jacket':'https://youraverageguystyle.com/wp-content/uploads/2018/05/Alpha-Bomber-Grey-Green-Teal-Orange.jpg',
    'mens-crew-neck-tee':'https://b.bflcdn.com/f_auto,q_auto/products/24/2/195718742769_CRP_1.JPG?w=600&h=600&quality=80&mode=crop',
    'mens-denim-trucker':'https://cdn.clothbase.com/uploads/62b13c22-a1e5-4da0-aa49-260b6d0197e9/clothbase_a3174-0004_0300707_1701700107903.jpg',
    'mens-grey-blazer':'https://www.tiptopgents.com/wp-content/uploads/2024/01/picsart_24-01-20_12-56-12-2758472826515232621150.webp',
    'men-slim-fit-suit-blazer':'https://www.suitsexpert.com/wp-content/uploads/how-to-fit-your-suit-basics.jpg',
    'mens-linen-casual-shirt':'https://m.media-amazon.com/images/I/71xUX3+ut7L._AC_UL1500_.jpg',
    'mens-overshirt-khaki':'https://cdn.platform.next/common/items/default/default/itemimages/3_4Ratio/AltItemZoom/B57729s.jpg?im=Resize,width=750',
    'mens-oxford-shirt':'https://i.pinimg.com/originals/d9/ba/1c/d9ba1c4e1145b335cef97c5a43824ee9.jpg',
    'mens-slim-chinos':'https://www.brostrick.com/wp-content/uploads/2017/05/royal-blue-chino-khaki-pants-mens-2017-2018.jpg',
    'mens-striped-polo':'https://assets.myntassets.com/h_200,w_200,c_fill,g_auto/h_1440,q_100,w_1080/v1/assets/images/9464629/2019/5/13/9cdd68ff-931d-4088-8faf-870cdf34b8461557726370110-Peter-England-Casuals-Men-Tshirts-5861557726368715-1.jpg',
    'mens-tailored-shorts':'https://i.pinimg.com/originals/73/f6/46/73f646c3041168a01e29b0cd9d3cf926.jpg',
    'men-stretch-denim-jeans':'https://i5.walmartimages.com/seo/Jettjeans-Men-s-High-Waist-Straight-Fit-Stretch-Jeans-Jett-Jeans-Men-Pants-Comfort-Denim-Men_7585159a-5556-4419-9ec2-3b3295b66ac5.e5fe2075f0f51e8596b66c1cb8c9b84e.jpeg',
    'men-summer-linen-shorts':'https://i.etsystatic.com/34485594/r/il/6d33a1/4802157582/il_1080xN.4802157582_rpkp.jpg',
    'mens-wool-overcoat':'https://i5.walmartimages.com/seo/WXLWZYWL-Mens-Double-Breasted-Trench-Coat-Notched-Lapel-Long-Peacoat-Classic-Casual-Winter-Overcoat-British-Style-Heavyweight-Mid-Long-Wool-Pea-Coat_1e1c4aa5-2745-4b2e-b197-9f734e219a04.c5d9ea5fdd2d3c99d4d76812fd008134.jpeg',
    'modern-men-checker-formal-shirt':'https://media.karousell.com/media/photos/products/2018/08/10/brand_new_dark_blue_checkered_shirt_white_1533883445_401edef9_progressive.jpg',
    'modern-men-minimal-shadow-set':'https://www.thefashionisto.com/wp-content/uploads/2023/05/Minimalist-Style-Men-UNIQLO.jpg',
    'modern-men-office-street-shirt':'https://cdn.luxe.digital/media/sites/7/2019/01/11174427/casual-dress-code-men-style-summer-luxe-digital.jpg',
    'modern-men-smart-blazer-look':'https://i.pinimg.com/originals/da/7c/21/da7c21a767eccb7a265a9689fcc3fb86.jpg',
    'modern-men-two-tone-casual-shirt':'https://d3d71ba2asa5oz.cloudfront.net/12013664/images/1510119_lilac_01.jpg',
    'modern-women-city-night-dress':'https://i.pinimg.com/originals/8e/e3/b9/8ee3b9a29e40e6f2b15c5ff6ea462da0.jpg',
    'modern-women-satin-midi-dress':'https://i.etsystatic.com/18771955/r/il/bd0a00/3206858903/il_fullxfull.3206858903_roar.jpg',
    'modern-women-soft-tailored-dress':'https://over50feeling40.com/wp-content/uploads/2024/03/2024-Fashion-Trends-Tailored-Vests-4.png',
    'modern-women-street-layer-set':'https://i.pinimg.com/originals/2b/c6/a8/2bc6a8fd816a406ebbe648071cc7b535.jpg',
    'modern-women-urban-jumpsuit':'https://cdn.shopify.com/s/files/1/0293/9277/files/03-06-24_S2_10_BEC12_DarkWash_KJ_RL_11-02-10_4564_PXF_CM.jpg?v=1709937864&width=2000&height=2994&crop=center',
    'red-wrap-midi-dress':'https://www.phase-eight.com/dw/image/v2/BDCH_PRD/on/demandware.static/-/Sites-master-Catalog-P8/default/dwc278aeba/images/221400724/221400724-05-julissa-ruffle-wrap-midi-dress.jpg?sw=1280&sh=1792&strip=false',
    'ruched-satin-mini-dress':'https://www.net-a-porter.com/variants/images/1647597288300177/bk/w2000_a3-4_q60.jpg',
    'tamil-arakku-pattu-saree':'https://shrus.com/cdn/shop/files/CCS05454_1_a67d4287-d794-410b-b78e-97b7f050ab36.jpg?v=1719062190&width=3024',
    'tamil-blue-border-veshti-pack':'https://assets.myntassets.com/h_200,w_200,c_fill,g_auto/h_1440,q_100,w_1080/v1/assets/images/20253380/2022/10/3/b6daa428-9045-44a4-b3ae-a877eb71e33e1664769019546MensSolidShirtDhotiSet1.jpg',
    'tamil-bridal-temple-jewellery-set':'https://www.southjewellery.com/wp-content/uploads/2022/12/gold-jewellery-set-scaled.jpg',
    'tamil-chettinad-handloom-saree':'https://i.etsystatic.com/25857047/r/il/0eab35/3025251682/il_1588xN.3025251682_e6cy.jpg',
    'tamil-classic-white-veshti-pack':'https://www.exoticindiaart.com/images/products/original/textiles-2019/taa670.webp',
    'tamil-gold-border-veshti-pack':'https://assets.myntassets.com/h_200,w_200,c_fill,g_auto/h_1440,q_100,w_1080/v1/assets/images/25719082/2023/11/1/9b545772-e0da-494b-980e-66d1a83b9cbc1698855710404ClothingSet1.jpg',
    'tamil-kanchipuram-bridal-silk-saree':'https://i.pinimg.com/originals/fd/90/50/fd905015be1479bc57dff3c8be604bc5.jpg',
    'tamil-pure-silk-saree-fabric':'https://www.sudarshansaree.com/cdn/shop/files/T-K12230993D.jpg?v=1685097361&width=1946',
    'tamil-royal-blue-temple-border-saree':'https://rangdhaaga.com/cdn/shop/files/rn-image_picker_lib_temp_d942b7da-219f-4431-bf57-2eed99bf0477.jpg?v=1733808701&width=%7Bwidth%7D',
    'tamil-south-indian-wedding-saree':'https://i.pinimg.com/originals/40/61/2e/40612e550f9b948a38d77fd8a0de5ca0.jpg?nii=t',
    'tamil-temple-jhumka-earrings':'https://southindiajewels.com/wp/wp-content/uploads/2015/10/gold-kemp-jhumka-design-Bhima-jewellers.jpg',
    'tamil-temple-ritual-dhoti-set':'https://i.pinimg.com/originals/84/59/71/8459712c183703e09e27032d2253d4fe.jpg',
    'tamil-traditional-dhoti-shirt-set':'https://www.exoticindiaart.com/images/products/original/textiles-2019/baa599-black.webp',
    'unisex-boxy-graphic-tee':'https://lsco.scene7.com/is/image/lsco/A88040049-front-pdp-ld?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500',
    'unisex-cargo-pants':'https://jaycotts.co.uk/cdn/shop/files/S9959_01_1530x2100.jpg?v=1718633678',
    'unisex-cotton-overshirt':'https://images-dynamic-arcteryx.imgix.net/details/1350x1710/S25-X000008448-Cronin-Cotton-Overshirt-Soulsonic-Front-View.jpg',
    'unisex-fleece-zip-jacket':'https://i5.walmartimages.com/asr/e49d3332-10b6-4afe-baeb-8a04f372e619.a8b7d3ff572554f3b062285f9897c4e0.jpeg',
    'unisex-graphic-zip-hoodie':'https://i.etsystatic.com/48755710/r/il/78da3d/5626904600/il_1080xN.5626904600_45db.jpg',
    'unisex-knit-joggers':'https://skims.imgix.net/s/files/1/0259/5448/4284/files/BO-JOG-4551-CPL-DB-SKIMS-LOUNGEWEAR_0007-FR_1ec9379a-c96a-4746-bfb6-9ef5ea56a413.jpg?v=1731110135&auto=format&w=1200',
    'unisex-knit-polo':'https://thevou.com/wp-content/uploads/2025/04/old-money-style-knitted-polo-shirts-skin-tones-men-colour.jpg',
    'unisex-lightweight-windbreaker':'https://i5.walmartimages.com/asr/38fdafbc-32ed-4cba-8070-57b1cfed273a_1.3785df9c041b322d8bbaf062c7a24cad.jpeg',
    'unisex-longline-coat':'https://bta.scene7.com/is/image/brownthomas/2000657705_04?$pdp_zoom$',
    'unisex-minimal-co-ord':'https://www.modora.co.uk/cdn/shop/files/camel-co-ord-uk.webp?crop=region&crop_height=2388&crop_left=94&crop_top=0&crop_width=1599&v=1693991288&width=1788',
    'unisex-oversized-tee':'https://i.pinimg.com/originals/0d/e5/4c/0de54c26b94ef342667fab8dfa89d3fb.jpg',
    'unisex-quarter-zip':'https://swag-prod.s3.us-east-2.amazonaws.com/images/623107301cf78a3cfe2bc774.jpg',
    'unisex-relaxed-blazer':'https://i5.walmartimages.com/seo/XINSDOAKK-Blazers-for-Women-Women-s-Relaxed-Scuba-Knit-Stretch-Blazer-with-Scrunch-Sleeves-Khaki-L_3975219e-ff3c-424d-bc44-40a8f323a10a.b6684fca1cba7e038a4adc0cd2012606.jpeg',
    'unisex-relaxed-shorts':'https://img1.g-star.com/product/c_fill,f_auto,h_2000,q_80/v1545131006/D08566-A809-A055-Z03/g-star-raw-rovic-relaxed-short-green-model-back-zoom.jpg',
    'unisex-ribbed-knit-set':'https://cdn.shopify.com/s/files/1/1056/2262/products/Hat-YCCHSS1541-charcoal-4_1600x.jpg?v=1652339336',
    'unisex-sport-track-pants':'https://www.tideandsail.in/images/mens/mens_sports_track_pants_fashion.jpg',
    'unisex-street-bomber':'https://static01.nyt.com/images/2015/08/20/fashion/20GENDER-slide-SPEF/20GENDER-slide-SPEF-superJumbo.jpg?quality=75&auto=webp&disable=upscale',
    'unisex-tech-cargo-vest':'https://i.etsystatic.com/5358468/r/il/ee08c4/2015787555/il_fullxfull.2015787555_e4jo.jpg',
    'unisex-tech-runner-jacket':'https://assets.adidas.com/images/w_1880,f_auto,q_auto/3b6292b324a540558a1d7a42e82e67b7_9366/IQ3845_HM1.jpg',
    'unisex-utility-jumpsuit':'https://media.neimanmarcus.com/f_auto,q_auto:low,ar_4:5,c_fill,dpr_2.0,w_790/01/nm_4387694_100426_a',
    'unisex-utility-shirt':'https://shop.porsche.com/_next/image?url=https:%2F%2Fassets-prod.porsche.com%2Fassets%2F50cd849d-fca8-4e25-a390-de2f538c58c9.webp&w=2560&q=75',
    'unisex-varsity-jacket':'https://cdn.shopify.com/s/files/1/1149/5724/products/plaid-unisex-varsity-jacket-patriot-plaid-unisex-outerwear-aviator-nation-971087_1200x.jpg?v=1682640442',
    'women-athleisure-zip-top':'https://crystalinmarie.com/wp-content/uploads/2017/01/Best-womens-nike-sweatshirt.jpg',
    'women-charcoal-coat':'https://i.etsystatic.com/5609612/r/il/00469d/3244153771/il_1140xN.3244153771_5c6j.jpg',
    'women-cozy-hoodie':'https://m.media-amazon.com/images/I/61glUTGQnUL._AC_SL1500_.jpg',
    'women-cropped-denim-jacket':'https://i.pinimg.com/originals/4a/e7/4c/4ae74ca46e9dbb69a1bd893373921559.jpg',
    'women-denim-midi-skirt':'https://www.whistles.com/dw/image/v2/BDCH_PRD/on/demandware.static/-/Sites-whistles-master-catalog/default/dw3078c7b8/images/00903658412/whistles-denim-midi-skirt-denim-05.jpg?sw=1280&sh=1792&strip=false',
    'women-floral-wrap-top':'https://i.pinimg.com/736x/5e/68/20/5e68207783d71b0019b3b2936ed54a8e.jpg',
    'women-hooded-sweat':'https://img.ltwebstatic.com/images3_pi/2023/12/26/fc/17035802101dfc4aea6e37d834b92c6487690e4296.jpg',
    'women-ivory-knit-top':'https://julesandjamesboutique.com/cdn/shop/files/5D135663-9D31-4371-B891-B755ED6BF256.jpg?v=1706890267&width=1500',
    'women-lounge-co-ord':'https://phenav.com/wp-content/uploads/2024/01/HHK322-COFFEE-5-scaled-1.jpg',
    'women-maxi-shirt-dress':'https://gloimg.rosegal.com/rosegal/pdm-product-pic/Clothing/2016/08/24/source-img/20160824121949_40196.jpg',
    'women-pearl-button-cardigan':'https://www.miabellebaby.com/cdn/shop/files/18_fcd966a4-ddd6-4737-9947-a0c7ca6729a9_1800x1800.png?v=1723482890',
    'women-pleated-maxi-skirt':'https://image.hm.com/assets/hm/0e/e3/0ee3b2b2c2d5094cbc4513af074ce01f7d1f1c69.jpg?imwidth=2160',
    'women-pleated-office-trouser':'https://i.pinimg.com/originals/b2/3f/31/b23f31b9e351da94a1fce640926ce631.jpg',
    'women-ruffle-neck-blouse':'https://belk.scene7.com/is/image/Belk?layer=0&src=1803975_7053075_A_060&%24=&wid=1200&fit=wrap',
    'women-satin-shirt':'https://i.pinimg.com/originals/21/5d/e2/215de22ec83071e0bfa48837f0b02aab.jpg',
    'women-silk-evening-gown':'https://i.pinimg.com/originals/af/bf/e6/afbfe61680b0a5d4005cceddc1347b34.jpg',
    'women-structured-midi-coat':'https://cdn.mos.cms.futurecdn.net/whowhatwear/posts/310665/best-long-coats-winter-310665-1706563209503-main-1920-80.jpg',
    'women-tailored-trouser':'https://images.squarespace-cdn.com/content/v1/5950a68720099e6f69ce32e4/1630655393929-Q3KVVQ8MTBD4MJ4FQW8K/Edge+Stitching+High+Waisted+Trousers+Made+by+Made+Suits+Using+Loro+Piana+Fabrics+FUCK+YOU+ASSEMBLESG.jpg?format=1500w',
    'women-wide-leg-linen-pants':'https://media.neimanmarcus.com/f_auto,q_auto:low,ar_4:5,c_fill,dpr_2.0,w_790/01/nm_4501451_100258_d'
  };

  const TYPE_IMAGE_POOL = {
    Dress:[
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80'
    ],
    Top:[
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80'
    ],
    Blazer:[
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1598673059661-d1e12cf526c9?auto=format&fit=crop&w=1200&q=80'
    ],
    Skirt:[
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618143445386-80a867d64641?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'
    ],
    Jacket:[
      'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1200&q=80'
    ],
    Pants:[
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80'
    ],
    Shirt:[
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=80'
    ],
    Coat:[
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80'
    ],
    Hoodie:[
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80'
    ],
    Sweatshirt:[
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80'
    ],
    Shorts:[
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80'
    ],
    Set:[
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1400&q=80'
    ],
    Cardigan:[
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80'
    ],
    Sweater:[
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=80'
    ],
    Vest:[
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80'
    ],
    Jumpsuit:[
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80'
    ],
    Saree:[
      'https://images.unsplash.com/photo-1618901185975-d59f7091bcfe',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb',
      'https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e'
    ],
    Veshti:[
      'https://images.unsplash.com/photo-1650632784843-5540e36e8aca',
      'https://images.unsplash.com/photo-1650632783832-bc7c10b2fd63',
      'https://images.unsplash.com/photo-1650632782277-0d089b0ce7fe'
    ],
    Jewelry:[
      'https://images.unsplash.com/photo-1726981448126-c7fc9237cdb5',
      'https://images.unsplash.com/photo-1621157636513-81a1687fdb0e',
      'https://images.unsplash.com/photo-1644523729338-f00c0b6ed5a4'
    ],
    Default:[
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1467043237213-65f2da53396f?auto=format&fit=crop&w=1400&q=80'
    ]
  };

  const EXTRA_PRODUCTS = [
    {id:'women-silk-evening-gown',name:'Women Silk Evening Gown',price:5280,image:'https://source.unsplash.com/1200x1600/?women,silk,gown,fashion&sig=301',images:['https://source.unsplash.com/1200x1600/?women,silk,gown,fashion&sig=301','https://source.unsplash.com/1200x1600/?women,evening,dress,runway&sig=302'],description:'Elegant silk evening gown with fluid drape and refined neckline.',gender:'Women',type:'Dress',sizes:['S','M','L'],colors:['Emerald','Ivory']},
    {id:'women-wide-leg-linen-pants',name:'Women Wide Leg Linen Pants',price:2860,image:'https://source.unsplash.com/1200x1600/?women,linen,pants,fashion&sig=303',images:['https://source.unsplash.com/1200x1600/?women,linen,pants,fashion&sig=303'],description:'Breathable wide leg linen pants for warm weather styling.',gender:'Women',type:'Pants',sizes:['26','28','30','32'],colors:['Sand','Olive']},
    {id:'women-pearl-button-cardigan',name:'Women Pearl Button Cardigan',price:3120,image:'https://source.unsplash.com/1200x1600/?women,cardigan,knitwear,fashion&sig=304',images:['https://source.unsplash.com/1200x1600/?women,cardigan,knitwear,fashion&sig=304'],description:'Soft knit cardigan detailed with pearl buttons and cropped fit.',gender:'Women',type:'Cardigan',sizes:['S','M','L'],colors:['Cream','Dusty Rose']},
    {id:'women-structured-midi-coat',name:'Women Structured Midi Coat',price:4980,image:'https://source.unsplash.com/1200x1600/?women,midi,coat,fashion&sig=305',images:['https://source.unsplash.com/1200x1600/?women,midi,coat,fashion&sig=305'],description:'Structured midi coat with premium tailoring for winter looks.',gender:'Women',type:'Coat',sizes:['S','M','L'],colors:['Camel','Graphite']},
    {id:'women-ruffle-neck-blouse',name:'Women Ruffle Neck Blouse',price:2480,image:'https://source.unsplash.com/1200x1600/?women,ruffle,blouse,fashion&sig=306',images:['https://source.unsplash.com/1200x1600/?women,ruffle,blouse,fashion&sig=306'],description:'Lightweight blouse with romantic ruffle neck and cuff detail.',gender:'Women',type:'Top',sizes:['XS','S','M','L'],colors:['Ivory','Lavender']},
    {id:'women-pleated-office-trouser',name:'Women Pleated Office Trouser',price:2990,image:'https://source.unsplash.com/1200x1600/?women,office,trouser,fashion&sig=307',images:['https://source.unsplash.com/1200x1600/?women,office,trouser,fashion&sig=307'],description:'Pleated office trouser with clean waistline and tapered finish.',gender:'Women',type:'Pants',sizes:['26','28','30','32'],colors:['Navy','Taupe']},
    {id:'women-maxi-shirt-dress',name:'Women Maxi Shirt Dress',price:3380,image:'https://source.unsplash.com/1200x1600/?women,maxi,shirt,dress&sig=308',images:['https://source.unsplash.com/1200x1600/?women,maxi,shirt,dress&sig=308'],description:'Button down maxi shirt dress with belt tie and relaxed movement.',gender:'Women',type:'Dress',sizes:['S','M','L'],colors:['Sky Blue','White']},
    {id:'women-athleisure-zip-top',name:'Women Athleisure Zip Top',price:2190,image:'https://source.unsplash.com/1200x1600/?women,athleisure,zip,top&sig=309',images:['https://source.unsplash.com/1200x1600/?women,athleisure,zip,top&sig=309'],description:'Stretch athleisure zip top built for daily active comfort.',gender:'Women',type:'Top',sizes:['S','M','L','XL'],colors:['Black','Sage']},

    {id:'men-slim-fit-suit-blazer',name:'Men Slim Fit Suit Blazer',price:4520,image:'https://source.unsplash.com/1200x1600/?men,suit,blazer,fashion&sig=310',images:['https://source.unsplash.com/1200x1600/?men,suit,blazer,fashion&sig=310'],description:'Modern slim fit blazer for formal and business occasions.',gender:'Men',type:'Blazer',sizes:['M','L','XL'],colors:['Navy','Grey']},
    {id:'men-stretch-denim-jeans',name:'Men Stretch Denim Jeans',price:2720,image:'https://source.unsplash.com/1200x1600/?men,denim,jeans,fashion&sig=311',images:['https://source.unsplash.com/1200x1600/?men,denim,jeans,fashion&sig=311'],description:'Comfort stretch denim jeans with modern straight fit.',gender:'Men',type:'Pants',sizes:['30','32','34','36'],colors:['Indigo','Washed Black']},
    {id:'men-cotton-polo-shirt',name:'Men Cotton Polo Shirt',price:1960,image:'https://source.unsplash.com/1200x1600/?men,cotton,polo,fashion&sig=312',images:['https://source.unsplash.com/1200x1600/?men,cotton,polo,fashion&sig=312'],description:'Soft cotton polo shirt with refined collar and button placket.',gender:'Men',type:'Top',sizes:['S','M','L','XL'],colors:['Forest','White']},
    {id:'men-classic-trench-coat',name:'Men Classic Trench Coat',price:5210,image:'https://source.unsplash.com/1200x1600/?men,trench,coat,fashion&sig=313',images:['https://source.unsplash.com/1200x1600/?men,trench,coat,fashion&sig=313'],description:'Classic trench coat with clean lapel and weather ready fabric.',gender:'Men',type:'Coat',sizes:['M','L','XL'],colors:['Khaki','Black']},
    {id:'men-knit-crew-sweater',name:'Men Knit Crew Sweater',price:2480,image:'https://source.unsplash.com/1200x1600/?men,knit,sweater,fashion&sig=314',images:['https://source.unsplash.com/1200x1600/?men,knit,sweater,fashion&sig=314'],description:'Soft knit crew sweater for premium comfort in cooler weather.',gender:'Men',type:'Sweater',sizes:['S','M','L','XL'],colors:['Charcoal','Beige']},
    {id:'men-formal-waistcoat',name:'Men Formal Waistcoat',price:2840,image:'https://source.unsplash.com/1200x1600/?men,formal,waistcoat,fashion&sig=315',images:['https://source.unsplash.com/1200x1600/?men,formal,waistcoat,fashion&sig=315'],description:'Tailored formal waistcoat ideal for layered ceremony outfits.',gender:'Men',type:'Vest',sizes:['M','L','XL'],colors:['Grey','Midnight']},
    {id:'men-casual-oversized-hoodie',name:'Men Casual Oversized Hoodie',price:2360,image:'https://source.unsplash.com/1200x1600/?men,oversized,hoodie,streetwear&sig=316',images:['https://source.unsplash.com/1200x1600/?men,oversized,hoodie,streetwear&sig=316'],description:'Relaxed oversized hoodie with brushed inner comfort.',gender:'Men',type:'Hoodie',sizes:['S','M','L','XL'],colors:['Stone','Black']},
    {id:'men-summer-linen-shorts',name:'Men Summer Linen Shorts',price:1880,image:'https://source.unsplash.com/1200x1600/?men,linen,shorts,fashion&sig=317',images:['https://source.unsplash.com/1200x1600/?men,linen,shorts,fashion&sig=317'],description:'Breathable linen shorts for easy summer and resort outfits.',gender:'Men',type:'Shorts',sizes:['30','32','34','36'],colors:['Sand','Olive']},

    {id:'unisex-varsity-jacket',name:'Unisex Varsity Jacket',price:3990,image:'https://source.unsplash.com/1200x1600/?unisex,varsity,jacket,streetwear&sig=318',images:['https://source.unsplash.com/1200x1600/?unisex,varsity,jacket,streetwear&sig=318'],description:'Bold varsity jacket with contrast sleeves and relaxed fit.',gender:'Unisex',type:'Jacket',sizes:['S','M','L','XL'],colors:['Black','Bottle Green']},
    {id:'unisex-boxy-graphic-tee',name:'Unisex Boxy Graphic Tee',price:1720,image:'https://source.unsplash.com/1200x1600/?unisex,boxy,graphic,tshirt&sig=319',images:['https://source.unsplash.com/1200x1600/?unisex,boxy,graphic,tshirt&sig=319'],description:'Boxy graphic tee with dropped shoulders and street silhouette.',gender:'Unisex',type:'Top',sizes:['S','M','L','XL'],colors:['White','Black']},
    {id:'unisex-tech-cargo-vest',name:'Unisex Tech Cargo Vest',price:2760,image:'https://source.unsplash.com/1200x1600/?unisex,cargo,vest,techwear&sig=320',images:['https://source.unsplash.com/1200x1600/?unisex,cargo,vest,techwear&sig=320'],description:'Utility tech cargo vest with pockets for layered styling.',gender:'Unisex',type:'Vest',sizes:['S','M','L','XL'],colors:['Graphite','Olive']},
    {id:'unisex-ribbed-knit-set',name:'Unisex Ribbed Knit Set',price:3520,image:'https://source.unsplash.com/1200x1600/?unisex,ribbed,knit,set,fashion&sig=321',images:['https://source.unsplash.com/1200x1600/?unisex,ribbed,knit,set,fashion&sig=321'],description:'Coordinated ribbed knit set for elevated relaxed dressing.',gender:'Unisex',type:'Set',sizes:['S','M','L'],colors:['Mocha','Cream']},
    {id:'unisex-sport-track-pants',name:'Unisex Sport Track Pants',price:2140,image:'https://source.unsplash.com/1200x1600/?unisex,track,pants,sportswear&sig=322',images:['https://source.unsplash.com/1200x1600/?unisex,track,pants,sportswear&sig=322'],description:'Sport track pants with contrast side line and tapered leg.',gender:'Unisex',type:'Pants',sizes:['S','M','L','XL'],colors:['Black','Navy']},
    {id:'unisex-utility-jumpsuit',name:'Unisex Utility Jumpsuit',price:4220,image:'https://source.unsplash.com/1200x1600/?unisex,utility,jumpsuit,fashion&sig=323',images:['https://source.unsplash.com/1200x1600/?unisex,utility,jumpsuit,fashion&sig=323'],description:'One piece utility jumpsuit with modern functional detailing.',gender:'Unisex',type:'Jumpsuit',sizes:['S','M','L','XL'],colors:['Khaki','Graphite']},
    {id:'unisex-fleece-zip-jacket',name:'Unisex Fleece Zip Jacket',price:2680,image:'https://source.unsplash.com/1200x1600/?unisex,fleece,zip,jacket&sig=324',images:['https://source.unsplash.com/1200x1600/?unisex,fleece,zip,jacket&sig=324'],description:'Warm fleece zip jacket with minimalist outdoors style.',gender:'Unisex',type:'Jacket',sizes:['S','M','L','XL'],colors:['Cream','Slate']},
    {id:'unisex-cotton-overshirt',name:'Unisex Cotton Overshirt',price:2460,image:'https://source.unsplash.com/1200x1600/?unisex,cotton,overshirt,fashion&sig=325',images:['https://source.unsplash.com/1200x1600/?unisex,cotton,overshirt,fashion&sig=325'],description:'Midweight cotton overshirt for easy trans seasonal layering.',gender:'Unisex',type:'Shirt',sizes:['S','M','L','XL'],colors:['Stone','Olive']}
  ];

  const TAMIL_TRADITIONAL_PRODUCTS = [
    {id:'tamil-kanchipuram-bridal-silk-saree',name:'Kanchipuram Bridal Silk Saree',price:6890,image:'https://images.unsplash.com/photo-1618901185975-d59f7091bcfe',images:['https://images.unsplash.com/photo-1618901185975-d59f7091bcfe'],description:'Classic bridal silk saree with rich zari border and festive drape.',gender:'Women',type:'Saree',sizes:['Free Size'],colors:['Red','Gold']},
    {id:'tamil-arakku-pattu-saree',name:'Arakku Pattu Saree',price:6420,image:'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb',images:['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb'],description:'Traditional arakku tone pattu saree styled for family and wedding occasions.',gender:'Women',type:'Saree',sizes:['Free Size'],colors:['Maroon','Orange']},
    {id:'tamil-royal-blue-temple-border-saree',name:'Royal Blue Temple Border Saree',price:6180,image:'https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e',images:['https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e'],description:'Royal blue saree with temple-inspired border work and elegant fall.',gender:'Women',type:'Saree',sizes:['Free Size'],colors:['Blue','Pink','Gold']},
    {id:'tamil-chettinad-handloom-saree',name:'Chettinad Handloom Saree',price:4520,image:'https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb',images:['https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb'],description:'Lightweight handloom saree with vibrant woven pattern for daily festive wear.',gender:'Women',type:'Saree',sizes:['Free Size'],colors:['Multi Color']},
    {id:'tamil-pure-silk-saree-fabric',name:'Kanchi Pure Silk Saree Fabric',price:5340,image:'https://images.unsplash.com/photo-1588140686379-1b76a52103dc',images:['https://images.unsplash.com/photo-1588140686379-1b76a52103dc'],description:'Rich silk weave with classic zari motifs for premium traditional saree tailoring.',gender:'Women',type:'Saree',sizes:['Free Size'],colors:['Crimson','Gold']},
    {id:'tamil-south-indian-wedding-saree',name:'South Indian Wedding Saree',price:7020,image:'https://images.unsplash.com/photo-1644523729338-f00c0b6ed5a4',images:['https://images.unsplash.com/photo-1644523729338-f00c0b6ed5a4'],description:'Wedding-ready drape with bold blouse pattern and heavy traditional detailing.',gender:'Women',type:'Saree',sizes:['Free Size'],colors:['Ruby','Gold']},
    {id:'tamil-temple-jhumka-earrings',name:'Temple Jhumka Earrings',price:1980,image:'https://images.unsplash.com/photo-1726981448126-c7fc9237cdb5',images:['https://images.unsplash.com/photo-1726981448126-c7fc9237cdb5'],description:'Traditional jhumka design inspired by temple jewellery styling.',gender:'Women',type:'Jewelry',sizes:['One Size'],colors:['Silver']},
    {id:'tamil-bridal-temple-jewellery-set',name:'Bridal Temple Jewellery Set',price:3890,image:'https://images.unsplash.com/photo-1621157636513-81a1687fdb0e',images:['https://images.unsplash.com/photo-1621157636513-81a1687fdb0e'],description:'Complete bridal jewellery look to pair with silk sarees and reception wear.',gender:'Women',type:'Jewelry',sizes:['One Size'],colors:['Gold','Ruby']},
    {id:'tamil-classic-white-veshti-pack',name:'Classic White Veshti Pack',price:2240,image:'https://images.unsplash.com/photo-1650632784843-5540e36e8aca',images:['https://images.unsplash.com/photo-1650632784843-5540e36e8aca'],description:'Traditional white veshti collection with multiple festive border color options.',gender:'Men',type:'Veshti',sizes:['Free Size'],colors:['White','Multi Border']},
    {id:'tamil-blue-border-veshti-pack',name:'Blue Border Veshti Pack',price:2360,image:'https://images.unsplash.com/photo-1650632783832-bc7c10b2fd63',images:['https://images.unsplash.com/photo-1650632783832-bc7c10b2fd63'],description:'Cotton veshti set featuring classic blue temple border finish.',gender:'Men',type:'Veshti',sizes:['Free Size'],colors:['White','Blue']},
    {id:'tamil-gold-border-veshti-pack',name:'Gold Border Veshti Pack',price:2490,image:'https://images.unsplash.com/photo-1650632782277-0d089b0ce7fe',images:['https://images.unsplash.com/photo-1650632782277-0d089b0ce7fe'],description:'Premium ceremonial veshti with broad gold border for wedding use.',gender:'Men',type:'Veshti',sizes:['Free Size'],colors:['White','Gold']},
    {id:'tamil-traditional-dhoti-shirt-set',name:'Traditional Dhoti Shirt Set',price:3180,image:'https://images.unsplash.com/photo-1757598079169-b8655dc3e933?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1757598079169-b8655dc3e933?auto=format&fit=crop&w=1200&q=80'],description:'Simple and elegant dhoti with classic white shirt styling for pooja and events.',gender:'Men',type:'Set',sizes:['38','40','42','44'],colors:['White']},
    {id:'tamil-temple-ritual-dhoti-set',name:'Temple Ritual Dhoti Set',price:3360,image:'https://images.unsplash.com/photo-1759816660075-31cf3d61c9c5',images:['https://images.unsplash.com/photo-1759816660075-31cf3d61c9c5'],description:'Ceremonial dhoti style inspired by temple festival traditional dress.',gender:'Men',type:'Set',sizes:['38','40','42','44'],colors:['White','Red']},
    {id:'tamil-korvai-bottle-green-silk-saree',name:'Korvai Bottle Green Silk Saree',price:6640,image:'https://upload.wikimedia.org/wikipedia/commons/6/62/Green_brocade_silk_saree.jpg',images:['https://upload.wikimedia.org/wikipedia/commons/6/62/Green_brocade_silk_saree.jpg'],description:'Handwoven korvai silk saree with rich bottle-green checks and festive zari border.',gender:'Women',type:'Saree',sizes:['Free Size'],colors:['Bottle Green','Gold','Pink']},
    {id:'tamil-blue-checks-korvai-saree',name:'Blue Checks Korvai Saree',price:6580,image:'https://images.unsplash.com/photo-1757351122515-21a7b61d682e?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1757351122515-21a7b61d682e?auto=format&fit=crop&w=1200&q=80'],description:'Classic blue korvai weave with traditional zari accents for festive occasions.',gender:'Women',type:'Saree',sizes:['Free Size'],colors:['Royal Blue','Gold','Red']},
    {id:'tamil-purple-butta-kanchipuram-saree',name:'Purple Butta Kanchipuram Saree',price:6720,image:'https://upload.wikimedia.org/wikipedia/commons/8/8f/South_Indian_Sari.jpg',images:['https://upload.wikimedia.org/wikipedia/commons/8/8f/South_Indian_Sari.jpg'],description:'Elegant purple silk saree with butta motifs and a rich contrast border.',gender:'Women',type:'Saree',sizes:['Free Size'],colors:['Purple','Gold','Green']},
    {id:'tamil-pattu-pavadai-dhavani-set',name:'Pattu Pavadai Dhavani Set',price:2980,image:'https://templedesigner.com/cdn/shop/files/DSC04253_8e00ba16-5cda-445b-bc37-0dc9321e9d51.jpg?v=1758456771&width=3884',images:['https://templedesigner.com/cdn/shop/files/DSC04253_8e00ba16-5cda-445b-bc37-0dc9321e9d51.jpg?v=1758456771&width=3884'],description:'Traditional pattu pavadai and dhavani combo made for temple and family functions.',gender:'Women',type:'Set',sizes:['XS','S','M','L'],colors:['Pink','Gold']},
    {id:'tamil-cream-dhoti-angavastram-set',name:'Cream Dhoti Angavastram Set',price:3450,image:'https://sethukrishna.com/cdn/shop/files/MenCreamColourArtSilkDhotiAngavastramComboSet_2.jpg?v=1691474200&width=900',images:['https://sethukrishna.com/cdn/shop/files/MenCreamColourArtSilkDhotiAngavastramComboSet_2.jpg?v=1691474200&width=900'],description:'Ceremonial cream dhoti set paired with matching angavastram and gold border.',gender:'Men',type:'Set',sizes:['38','40','42','44'],colors:['Cream','Gold']}
  ];

  const MODERN_COLLECTION_PRODUCTS = [
    {id:'modern-women-satin-midi-dress',name:'Modern Women Satin Midi Dress',price:3980,image:'https://images.unsplash.com/photo-1704775989614-8435994e4e97',images:['https://images.unsplash.com/photo-1704775989614-8435994e4e97'],description:'Minimal satin midi silhouette with an asymmetrical cut for evening styling.',gender:'Women',type:'Dress',sizes:['XS','S','M','L'],colors:['Midnight Black']},
    {id:'modern-women-city-night-dress',name:'Women City Night Dress',price:4220,image:'https://images.unsplash.com/photo-1759090889296-1b82083f981d',images:['https://images.unsplash.com/photo-1759090889296-1b82083f981d'],description:'Bold city-ready dress with modern texture and statement confidence.',gender:'Women',type:'Dress',sizes:['S','M','L'],colors:['Black']},
    {id:'modern-women-urban-jumpsuit',name:'Women Urban Jumpsuit',price:3750,image:'https://images.unsplash.com/photo-1651828854976-4fa163b636ff',images:['https://images.unsplash.com/photo-1651828854976-4fa163b636ff'],description:'Lightweight urban jumpsuit designed for all-day movement and clean layering.',gender:'Women',type:'Set',sizes:['S','M','L','XL'],colors:['Peach','Off White']},
    {id:'modern-women-street-layer-set',name:'Women Street Layer Set',price:3480,image:'https://images.unsplash.com/photo-1652473291473-440ca687f82e',images:['https://images.unsplash.com/photo-1652473291473-440ca687f82e'],description:'Relaxed oversized layer set with modern street styling and neutral tones.',gender:'Women',type:'Set',sizes:['S','M','L','XL'],colors:['Ivory','Grey']},
    {id:'modern-women-soft-tailored-dress',name:'Women Soft Tailored Dress',price:3640,image:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',images:['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80'],description:'Soft tailored modern dress balancing structured form and fluid fit.',gender:'Women',type:'Dress',sizes:['S','M','L'],colors:['Rust Red']},

    {id:'modern-men-office-street-shirt',name:'Men Office Street Shirt',price:3140,image:'https://images.unsplash.com/photo-1598033067000-6a57d614b183',images:['https://images.unsplash.com/photo-1598033067000-6a57d614b183'],description:'Smart office shirt styled with modern city color grading and slim fit.',gender:'Men',type:'Shirt',sizes:['S','M','L','XL'],colors:['Ice Blue','Navy']},
    {id:'modern-men-two-tone-casual-shirt',name:'Men Two Tone Casual Shirt',price:2890,image:'https://images.unsplash.com/photo-1609402122820-9cb32081a555',images:['https://images.unsplash.com/photo-1609402122820-9cb32081a555'],description:'Contemporary two-tone shirt with clean silhouette for modern casual outfits.',gender:'Men',type:'Shirt',sizes:['S','M','L','XL'],colors:['Plum','Stone']},
    {id:'modern-men-minimal-shadow-set',name:'Men Minimal Shadow Set',price:3320,image:'https://images.unsplash.com/photo-1630173250799-2813d34ed14b',images:['https://images.unsplash.com/photo-1630173250799-2813d34ed14b'],description:'Minimal dark-toned outfit set built for sleek day-to-night styling.',gender:'Men',type:'Set',sizes:['M','L','XL'],colors:['Graphite','Black']},
    {id:'modern-men-smart-blazer-look',name:'Men Smart Blazer Look',price:4380,image:'https://images.unsplash.com/photo-1616469987545-6a037d893e72',images:['https://images.unsplash.com/photo-1616469987545-6a037d893e72'],description:'Modern blazer look for elevated smart-casual and semi-formal dressing.',gender:'Men',type:'Blazer',sizes:['M','L','XL'],colors:['Stone Grey']},
    {id:'modern-men-checker-formal-shirt',name:'Men Checker Formal Shirt',price:2760,image:'https://images.unsplash.com/photo-1693714700046-1bd7ad043dbb',images:['https://images.unsplash.com/photo-1693714700046-1bd7ad043dbb'],description:'Sharp checked formal shirt with contemporary fit for modern workwear.',gender:'Men',type:'Shirt',sizes:['S','M','L','XL'],colors:['Blue','White']}
  ];

  function hashCode(text){
    var s = String(text || '');
    var hash = 0;
    for(var i=0;i<s.length;i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
    return Math.abs(hash);
  }

  function needsImageReplacement(url){
    var value = String(url || '').trim();
    if(!value) return true;
    return value.indexOf('encrypted-tbn0.gstatic.com') !== -1 ||
      value.indexOf('source.unsplash.com') !== -1 ||
      value.indexOf('loremflickr.com') !== -1;
  }

  function pickTypeImage(product, variant){
    var typeKey = String((product && product.type) || 'Default');
    var pool = TYPE_IMAGE_POOL[typeKey] || TYPE_IMAGE_POOL.Default;
    var index = (hashCode((product && product.id) || (product && product.name) || '') + (variant || 0)) % pool.length;
    return pool[index];
  }

  const BRAND_LIBRARY = ['Zara', 'Mango', 'ASOS Design', 'Topshop', 'H&M', 'Princess Polly'];
  const DEFAULT_BRAND = BRAND_LIBRARY[0];
  function normalizeBrand(value){
    var brand = String(value || '').trim();
    return brand;
  }
  function pickBrandForProduct(product){
    var explicit = normalizeBrand(product && product.brand);
    if(explicit && explicit.toLowerCase() !== 'velvet vogue') return explicit;
    var key = String((product && product.id) || (product && product.name) || '');
    var index = hashCode(key) % BRAND_LIBRARY.length;
    return BRAND_LIBRARY[index];
  }
  function getProductBrand(product){
    return pickBrandForProduct(product);
  }

  function buildUniqueImage(product, salt){
    var id = String((product && product.id) || '').trim();
    if(id && IMAGE_OVERRIDES[id]) return String(IMAGE_OVERRIDES[id]);
    return pickTypeImage(product, salt || 0);
  }

  function ensureUniqueProductImages(products){
    var imageCount = {};
    (products || []).forEach(function (product) {
      var src = String((product && product.image) || '').trim();
      if(!src) return;
      imageCount[src] = (imageCount[src] || 0) + 1;
    });

    return (products || []).map(function (product, idx) {
      var next = Object.assign({}, product || {});
      var baseSalt = idx + hashCode(String(next.id || next.name || idx));
      var primary = String(next.image || '').trim();
      if(!primary || needsImageReplacement(primary) || imageCount[primary] > 1){
        primary = buildUniqueImage(next, baseSalt);
      }
      next.image = primary;

      var list = [];
      function pushUnique(src){
        var value = String(src || '').trim();
        if(!value || needsImageReplacement(value)) return;
        if(imageCount[value] > 1 && value !== primary) return;
        if(list.indexOf(value) !== -1) return;
        list.push(value);
      }

      pushUnique(primary);
      (Array.isArray(next.images) ? next.images : []).forEach(pushUnique);
      var extra = 0;
      while(list.length < 4){
        extra += 1;
        pushUnique(buildUniqueImage(next, baseSalt + extra));
        if(extra > 12) break;
      }
      next.images = list.slice(0, 4);
      return next;
    });
  }

  function normalizeProductSeed(product){
    var override = IMAGE_OVERRIDES[product.id] || '';
    var primary = String(override || product.image || '').trim();
    if(needsImageReplacement(primary)) primary = buildUniqueImage(product, 0);

    var sourceImages = Array.isArray(product.images) && product.images.length ? product.images : [primary];
    var safeImages = sourceImages
      .map(function (src, i) {
        var value = String(src || '').trim();
        if (needsImageReplacement(value)) return buildUniqueImage(product, i + 1);
        return value;
      })
      .filter(Boolean);

    if (!safeImages.length) safeImages = [primary, buildUniqueImage(product, 1)];
    if (safeImages.indexOf(primary) === -1) safeImages.unshift(primary);
    safeImages = Array.from(new Set(safeImages)).slice(0, 4);
    if (override) safeImages = [primary];

    return Object.assign({}, product, {
      brand: getProductBrand(product),
      image: primary,
      images: safeImages
    });
  }

  function normalizeDynamicProduct(product){
    var seed = Object.assign({
      id:'custom-product',
      name:'Custom Product',
      type:'Default',
      brand: DEFAULT_BRAND
    }, product || {});

    var override = IMAGE_OVERRIDES[seed.id] || '';
    var primary = String(override || seed.image || '').trim();
    if(needsImageReplacement(primary)) primary = buildUniqueImage(seed, 0);

    var rawImages = Array.isArray(seed.images) && seed.images.length ? seed.images : [primary];
    var safeImages = rawImages
      .map(function (src, i) {
        var value = String(src || '').trim();
        if (needsImageReplacement(value)) return buildUniqueImage(seed, i + 1);
        return value;
      })
      .filter(Boolean);

    if (!safeImages.length) safeImages = [primary, buildUniqueImage(seed, 1)];
    if (safeImages.indexOf(primary) === -1) safeImages.unshift(primary);
    if (override) safeImages = [primary];

    return Object.assign({}, seed, {
      brand: getProductBrand(seed),
      image: primary,
      images: Array.from(new Set(safeImages)).slice(0, 4)
    });
  }

  const BASE_PRODUCTS = ensureUniqueProductImages(
    MODERN_COLLECTION_PRODUCTS.concat(SEED_PRODUCTS, EXTRA_PRODUCTS, TAMIL_TRADITIONAL_PRODUCTS).map(normalizeProductSeed)
  );

  const CART_KEY = 'vv_cart';
  const CART_MAP_KEY = 'vv_cart_by_user';
  const CART_OWNER_KEY = 'vv_cart_owner';
  const ADMIN_KEY = 'vv_admin_products';
  const REMOVED_BASE_KEY = 'vv_removed_base_products';
  const AUTH_KEY = 'vv_auth';
  const WISHLIST_KEY = 'vv_wishlist_by_user';

  function getAdminProducts(){ try{return JSON.parse(localStorage.getItem(ADMIN_KEY)||'[]')}catch(e){return[]} }
  function saveAdminProducts(items){ localStorage.setItem(ADMIN_KEY, JSON.stringify(items)); }
  function getAuth(){ try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'')}catch(e){return null} }
  function getCartMap(){
    try{
      const raw = JSON.parse(localStorage.getItem(CART_MAP_KEY)||'{}');
      return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    }catch(e){return{}}
  }
  function saveCartMap(map){ localStorage.setItem(CART_MAP_KEY, JSON.stringify(map||{})); }
  function getCartUserKey(auth){
    const a = auth || getAuth();
    if(!a || !a.username) return 'guest:local';
    const role = String(a.role||'customer').toLowerCase().trim() || 'customer';
    const username = String(a.username||'').toLowerCase().trim();
    return username ? (role + ':' + username) : 'guest:local';
  }
  function normalizeCartItems(items){
    const list = Array.isArray(items) ? items : [];
    const merged = {};
    list.forEach(raw=>{
      if(!raw || typeof raw !== 'object') return;
      const productId = String(raw.productId||'').trim();
      if(!productId) return;
      const size = String(raw.size||'').trim();
      const color = String(raw.color||'').trim();
      const key = String(raw.key || (productId + '|' + size + '|' + color)).trim();
      if(!key) return;
      const qtyValue = Number(raw.qty);
      const qty = Number.isFinite(qtyValue) ? Math.max(1, Math.floor(qtyValue)) : 1;
      if(!merged[key]){
        merged[key] = {key:key, productId:productId, qty:qty, size:size, color:color};
        return;
      }
      merged[key].qty += qty;
    });
    return Object.values(merged);
  }
  function readLegacyCartUnsafe(){
    try{
      const raw = JSON.parse(localStorage.getItem(CART_KEY)||'[]');
      return Array.isArray(raw) ? raw : [];
    }catch(e){return[]}
  }
  function getLegacyCartOwner(){
    return String(localStorage.getItem(CART_OWNER_KEY)||'').trim();
  }
  function syncLegacyCartMirrorForCurrentUser(){
    const currentKey = getCartUserKey();
    const map = getCartMap();
    const items = normalizeCartItems(map[currentKey]||[]);
    const next = JSON.stringify(items);
    if(getLegacyCartOwner() !== currentKey){
      localStorage.setItem(CART_OWNER_KEY, currentKey);
    }
    if((localStorage.getItem(CART_KEY)||'[]') !== next){
      localStorage.setItem(CART_KEY, next);
    }
  }
  function initializeCartStorage(){
    const map = getCartMap();
    const legacyOwner = getLegacyCartOwner();
    let changed = false;

    if(legacyOwner && !Object.prototype.hasOwnProperty.call(map, legacyOwner)){
      map[legacyOwner] = normalizeCartItems(readLegacyCartUnsafe());
      changed = true;
    }

    const currentKey = getCartUserKey();
    if(!Object.prototype.hasOwnProperty.call(map, currentKey)){
      map[currentKey] = [];
      changed = true;
    }

    // First login/register: carry guest cart to the customer account once.
    if(currentKey !== 'guest:local'){
      const guestItems = normalizeCartItems(map['guest:local']||[]);
      const currentItems = normalizeCartItems(map[currentKey]||[]);
      if(!currentItems.length && guestItems.length){
        map[currentKey] = guestItems;
        map['guest:local'] = [];
        changed = true;
      }
    }

    if(changed) saveCartMap(map);
    syncLegacyCartMirrorForCurrentUser();
  }
  function getCartForUser(userKey){
    const key = String(userKey||'').trim();
    if(!key) return [];
    const map = getCartMap();
    if(Object.prototype.hasOwnProperty.call(map, key)){
      return normalizeCartItems(map[key]);
    }
    return [];
  }
  function saveCartForUser(userKey, items){
    const key = String(userKey||'').trim();
    if(!key) return false;
    const map = getCartMap();
    map[key] = normalizeCartItems(items);
    saveCartMap(map);
    try{
      if(window.VVBackend && typeof window.VVBackend.setCart === 'function'){
        window.VVBackend.setCart(key, map[key])
          .then(function(result){
            if(result && result.ok && result.data && result.data.ok) return;
            if(window.VVBackend && typeof window.VVBackend.syncFromServerAsync === 'function'){
              window.VVBackend.syncFromServerAsync();
            }
          })
          .catch(function(){
            if(window.VVBackend && typeof window.VVBackend.syncFromServerAsync === 'function'){
              window.VVBackend.syncFromServerAsync();
            }
          });
      }
    }catch(e){}
    if(key === getCartUserKey()) syncLegacyCartMirrorForCurrentUser();
    return true;
  }
  function getWishlistMap(){
    try{
      const raw = JSON.parse(localStorage.getItem(WISHLIST_KEY)||'{}');
      return raw && typeof raw === 'object' ? raw : {};
    }catch(e){return{}}
  }
  function saveWishlistMap(map){ localStorage.setItem(WISHLIST_KEY, JSON.stringify(map||{})); }
  function normalizeWishlistItems(items){
    return Array.from(new Set((Array.isArray(items) ? items : []).map(v=>String(v)).filter(Boolean)));
  }
  function getWishlistUserKey(auth){
    const a = auth || getAuth();
    if(!a || !a.username) return 'guest:local';
    if(a.role !== 'customer') return '';
    return String(a.username||'').toLowerCase().trim() || 'guest:local';
  }
  function getWishlistForUser(userKey){
    const key = String(userKey||'').toLowerCase().trim();
    if(!key) return [];
    const map = getWishlistMap();
    return normalizeWishlistItems(map[key]);
  }
  function saveWishlistForUser(userKey, items){
    const key = String(userKey||'').toLowerCase().trim();
    if(!key) return false;
    const map = getWishlistMap();
    map[key] = normalizeWishlistItems(items);
    saveWishlistMap(map);
    try{
      if(window.VVBackend && typeof window.VVBackend.setWishlist === 'function'){
        window.VVBackend.setWishlist(key, map[key])
          .then(function(result){
            if(result && result.ok && result.data && result.data.ok) return;
            if(window.VVBackend && typeof window.VVBackend.syncFromServerAsync === 'function'){
              window.VVBackend.syncFromServerAsync();
            }
          })
          .catch(function(){
            if(window.VVBackend && typeof window.VVBackend.syncFromServerAsync === 'function'){
              window.VVBackend.syncFromServerAsync();
            }
          });
      }
    }catch(e){}
    return true;
  }
  function getWishlist(){
    const key = getWishlistUserKey();
    return key ? getWishlistForUser(key) : [];
  }
  function saveWishlist(items){
    const key = getWishlistUserKey();
    return key ? saveWishlistForUser(key, items) : false;
  }
  function isWishlisted(productId){
    const id = String(productId||'').trim();
    if(!id) return false;
    return getWishlist().includes(id);
  }
  function addToWishlist(productId){
    const id = String(productId||'').trim();
    const key = getWishlistUserKey();
    if(!id || !key) return false;
    const list = getWishlistForUser(key);
    if(list.includes(id)) return false;
    list.push(id);
    saveWishlistForUser(key, list);
    return true;
  }
  function removeFromWishlist(productId){
    const id = String(productId||'').trim();
    const key = getWishlistUserKey();
    if(!id || !key) return false;
    const list = getWishlistForUser(key);
    const next = list.filter(v=>v!==id);
    if(next.length === list.length) return false;
    saveWishlistForUser(key, next);
    return true;
  }
  function toggleWishlist(productId){
    if(isWishlisted(productId)){
      removeFromWishlist(productId);
      return false;
    }
    return !!addToWishlist(productId);
  }
  function clearWishlist(){
    const key = getWishlistUserKey();
    if(!key) return false;
    return saveWishlistForUser(key, []);
  }
  function initializeWishlistStorage(){
    const map = getWishlistMap();
    const currentKey = getWishlistUserKey();
    if(!currentKey) return;

    let changed = false;
    if(!Object.prototype.hasOwnProperty.call(map, currentKey)){
      map[currentKey] = [];
      changed = true;
    } else {
      const normalizedCurrent = normalizeWishlistItems(map[currentKey]);
      if(JSON.stringify(normalizedCurrent) !== JSON.stringify(map[currentKey] || [])){
        map[currentKey] = normalizedCurrent;
        changed = true;
      }
    }

    if(currentKey !== 'guest:local'){
      const guestList = normalizeWishlistItems(map['guest:local']);
      const currentList = normalizeWishlistItems(map[currentKey]);
      if(!currentList.length && guestList.length){
        map[currentKey] = guestList;
        map['guest:local'] = [];
        changed = true;
      }
    }

    if(changed) saveWishlistMap(map);
  }
  initializeCartStorage();
  initializeWishlistStorage();
  function getRemovedBaseProductIds(){
    try{
      const raw = JSON.parse(localStorage.getItem(REMOVED_BASE_KEY)||'[]');
      if(!Array.isArray(raw)) return [];
      return raw.map(v=>String(v)).filter(Boolean);
    }catch(e){return[]}
  }
  function saveRemovedBaseProductIds(ids){
    const unique = Array.from(new Set((ids||[]).map(v=>String(v)).filter(Boolean)));
    localStorage.setItem(REMOVED_BASE_KEY, JSON.stringify(unique));
  }
  function isBaseProductId(id){ return BASE_PRODUCTS.some(p=>p.id===id); }
  function removeProductById(id){
    const productId = String(id||'').trim();
    if(!productId) return false;
    let changed = false;

    const adminProducts = getAdminProducts();
    const nextAdmin = adminProducts.filter(p=>p.id!==productId);
    if(nextAdmin.length !== adminProducts.length){
      saveAdminProducts(nextAdmin);
      changed = true;
    }

    if(isBaseProductId(productId)){
      const removed = getRemovedBaseProductIds();
      if(!removed.includes(productId)){
        removed.push(productId);
        saveRemovedBaseProductIds(removed);
        changed = true;
      }
    }

    if(changed){
      const cartMap = getCartMap();
      let cartChanged = false;
      Object.keys(cartMap).forEach(userKey=>{
        const list = normalizeCartItems(cartMap[userKey]);
        const next = list.filter(item=>item.productId!==productId);
        if(next.length !== list.length){
          cartMap[userKey] = next;
          cartChanged = true;
        }
      });
      if(cartChanged){
        saveCartMap(cartMap);
        syncLegacyCartMirrorForCurrentUser();
      }

      const wishMap = getWishlistMap();
      let wishChanged = false;
      Object.keys(wishMap).forEach(userKey=>{
        const list = Array.isArray(wishMap[userKey]) ? wishMap[userKey].map(v=>String(v)) : [];
        const next = list.filter(v=>v!==productId);
        if(next.length !== list.length){
          wishMap[userKey] = next;
          wishChanged = true;
        }
      });
      if(wishChanged) saveWishlistMap(wishMap);
    }
    return changed;
  }
  function getAllProducts(){
    const removedSet = new Set(getRemovedBaseProductIds());
    let baseVisible = BASE_PRODUCTS.filter(p=>!removedSet.has(p.id));
    const adminProducts = getAdminProducts().map(normalizeDynamicProduct);
    // Safety: if every product is hidden in local storage, auto-restore base catalog.
    if(!baseVisible.length && !adminProducts.length){
      localStorage.removeItem(REMOVED_BASE_KEY);
      baseVisible = BASE_PRODUCTS.slice();
    }
    return ensureUniqueProductImages(baseVisible.concat(adminProducts));
  }
  function getProductById(id){ return getAllProducts().find(p=>p.id===id); }
  function getCart(){ return getCartForUser(getCartUserKey()); }
  function saveCart(items){ return saveCartForUser(getCartUserKey(), items); }
  function addToCart(productId, qty, size, color){
    const id = String(productId||'').trim();
    if(!id) return false;
    const qtyValue = Number(qty);
    const addQty = Number.isFinite(qtyValue) ? Math.max(1, Math.floor(qtyValue)) : 1;
    const itemSize = String(size||'').trim();
    const itemColor = String(color||'').trim();
    const items = getCart();
    const key = id + '|' + itemSize + '|' + itemColor;
    const found = items.find(i=>i.key===key);
    if(found){ found.qty += addQty; }
    else { items.push({key:key, productId:id, qty:addQty, size:itemSize, color:itemColor}); }
    return saveCart(items);
  }
  function updateQty(key, qty){
    const id = String(key||'').trim();
    if(!id) return false;
    const qtyValue = Number(qty);
    const nextQty = Number.isFinite(qtyValue) ? Math.max(1, Math.floor(qtyValue)) : 1;
    const items=getCart().map(i=> i.key===id ? {...i, qty:nextQty} : i);
    return saveCart(items);
  }
  function removeItem(key){
    const id = String(key||'').trim();
    if(!id) return false;
    return saveCart(getCart().filter(i=>i.key!==id));
  }
  function clearCart(){ return saveCart([]); }
  function money(v){ return 'LKR '+Number(v).toFixed(2); }

  window.VV = {
    BRAND_LIBRARY,
    DEFAULT_BRAND,
    pickBrandForProduct,
    getProductBrand,
    BASE_PRODUCTS,
    getAllProducts,
    getProductById,
    getCart,
    saveCart,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    money,
    getWishlist,
    saveWishlist,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    getWishlistMap,
    saveWishlistMap,
    CART_KEY,
    CART_MAP_KEY,
    WISHLIST_KEY,
    getAdminProducts,
    saveAdminProducts,
    getRemovedBaseProductIds,
    saveRemovedBaseProductIds,
    removeProductById,
    REMOVED_BASE_KEY
  };
})();
