export const CATEGORIES = [
  { value: 'all',      label: 'All Products' },
  { value: 'lace',     label: 'Lace' },
  { value: 'ankara',   label: 'Ankara' },
  { value: 'senator',  label: 'Senator Materials' },
  { value: 'guinea',   label: 'Guinea Brocade' },
  { value: 'bonnet',   label: 'Bonnets' },
  { value: 'cap',      label: 'Alhaji Caps' },
  { value: 'children', label: "Baby/Children's Wears" },
  { value: 'adire',    label: 'Adire' },
  { value: 'george',   label: 'George' },
];

export const DEFAULT_PRODUCTS = [
  {
    id: 1, name: 'Royal Ankara', category: 'ankara',
    description: 'Vibrant wax-print Ankara with bold geometric patterns. Perfect for traditional and contemporary wear.',
    price: 4500, unit: 'per yard', minOrder: 1, bulkPrice: 3800, bulkMin: 10,
    badge: 'Bestseller', inStock: true, featured: true, tags: ['traditional','colorful','wax print'],
    pattern: 'linear-gradient(145deg,#8B1A1A 0%,#D4380D 25%,#FA8C16 50%,#1D6B1D 75%,#003A8C 100%)',
  },
  {
    id: 2, name: 'Guinea Brocade', category: 'guinea',
    description: 'Luxurious Guinea Brocade with intricate raised patterns and a lustrous sheen. Ideal for ceremonies.',
    price: 8500, unit: 'per yard', minOrder: 2, bulkPrice: 7200, bulkMin: 8,
    badge: 'Premium', inStock: true, featured: true, tags: ['ceremony','luxury','sheen'],
    pattern: 'linear-gradient(135deg,#1a2a1a 0%,#2d5a2d 30%,#4a7c4a 60%,#6b9e6b 100%)',
  },
  {
    id: 3, name: 'Swiss Lace', category: 'lace',
    description: 'Exquisite Swiss lace with delicate floral embroidery. The choice of brides and queens.',
    price: 12000, unit: 'per yard', minOrder: 3, bulkPrice: 10500, bulkMin: 6,
    badge: 'Exclusive', inStock: true, featured: true, tags: ['wedding','lace','embroidery'],
    pattern: 'radial-gradient(ellipse at 30% 30%,rgba(255,255,255,0.15) 0%,transparent 50%),linear-gradient(135deg,#0d0d2e 0%,#1a1a4a 50%,#0d2e4a 100%)',
  },
  {
    id: 4, name: 'Senator Material', category: 'senator',
    description: 'Premium Senator fabric for men — polished, regal and perfect for any native occasion.',
    price: 6500, unit: 'per yard', minOrder: 2, bulkPrice: 5500, bulkMin: 8,
    badge: 'Trending', inStock: true, featured: true, tags: ['senator','male','native','formal'],
    pattern: 'repeating-linear-gradient(0deg,rgba(201,168,76,0.15) 0,rgba(201,168,76,0.15) 1px,transparent 0,transparent 12px),repeating-linear-gradient(90deg,rgba(201,168,76,0.15) 0,rgba(201,168,76,0.15) 1px,transparent 0,transparent 12px),linear-gradient(135deg,#0a0a1a 0%,#1a1a2e 50%,#0d1a0d 100%)',
  },
  {
    id: 5, name: 'Embroidered Alhaji Cap', category: 'cap',
    description: 'Premium hand-embroidered Alhaji caps in various colours. A distinguished finish for any native outfit.',
    price: 3500, unit: 'per piece', minOrder: 1, bulkPrice: 2800, bulkMin: 5,
    badge: 'Handcrafted', inStock: true, featured: false, tags: ['cap','alhaji','embroidered','male','accessory'],
    pattern: 'radial-gradient(circle at 30% 30%,rgba(201,168,76,0.6),transparent 50%),radial-gradient(circle at 70% 70%,rgba(160,100,20,0.5),transparent 50%),linear-gradient(135deg,#1a0d00,#2d1a00)',
  },
  {
    id: 6, name: 'Bonnet Collection', category: 'bonnet',
    description: 'Quality bonnets for all types — satin-lined, lace-trimmed and everyday styles for every hair type.',
    price: 1800, unit: 'per piece', minOrder: 1, bulkPrice: 1400, bulkMin: 10,
    badge: 'All Types', inStock: true, featured: false, tags: ['bonnet','hair','satin','accessories'],
    pattern: 'radial-gradient(ellipse at 50% 20%,rgba(200,100,150,0.4),transparent 60%),radial-gradient(ellipse at 50% 80%,rgba(100,50,120,0.4),transparent 60%),linear-gradient(135deg,#1a0010,#0d001a)',
  },
  {
    id: 7, name: "Children's Native Wear", category: 'children',
    description: "Premium baby and children's native fabrics and ready-to-wear outfits. Adorable styles for little ones.",
    price: 4500, unit: 'per set', minOrder: 1, bulkPrice: 3800, bulkMin: 5,
    badge: 'Kids', inStock: true, featured: false, tags: ['children','baby','kids','native','cute'],
    pattern: 'repeating-linear-gradient(45deg,rgba(255,180,50,0.3) 0,rgba(255,180,50,0.3) 4px,transparent 0,transparent 16px),repeating-linear-gradient(-45deg,rgba(50,180,255,0.3) 0,rgba(50,180,255,0.3) 4px,transparent 0,transparent 16px),linear-gradient(135deg,#001a10,#1a0010)',
  },
  {
    id: 8, name: 'Adire Eleko', category: 'adire',
    description: "Authentic hand-resist dyed Adire. Each piece is unique, carrying the artisan's signature.",
    price: 5500, unit: 'per yard', minOrder: 1, bulkPrice: 4700, bulkMin: 8,
    badge: 'Artisan', inStock: true, featured: false, tags: ['artisan','handmade','unique','indigo'],
    pattern: 'radial-gradient(circle at 20% 20%,rgba(30,80,150,0.8),transparent 40%),radial-gradient(circle at 80% 80%,rgba(20,50,120,0.8),transparent 40%),linear-gradient(135deg,#050a1a,#0a1a3d)',
  },
];

export const NIGERIAN_STATES = [
  'Kwara','Lagos','Abuja','Ogun','Oyo','Rivers','Kano','Anambra',
  'Enugu','Delta','Edo','Imo','Kaduna','Kogi','Osun','Ekiti','Other'
];

export const formatPrice = (n) =>
  '₦' + Number(n).toLocaleString('en-NG');
