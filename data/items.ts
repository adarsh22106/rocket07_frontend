const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface MenuItem {
  name: string;
  price: number;
  unit: string;
}

export interface ItemsCatalog {
  [category: string]: MenuItem[];
}

export const itemsCatalogPromise: Promise<ItemsCatalog> = getItemsCatalog();

export async function getItemsCatalog(): Promise<ItemsCatalog> {
  try {
    const res = await fetch(`${API_BASE}/catalog`);
    const json = await res.json();
    return json.data || {};
  } catch (err) {
    console.error("Failed to fetch catalog", err);
    return {};
  }
}

export const ITEM_IMAGE_MAP: Record<string, string> = {
  'White Bread': 'white_bread_metro_gold.png',
  'Bhuja Chana': 'roasted_chana_250gm.jpg',
  'Maggie (Small - 75g)': 'maggie_small_packet.jpg',
  'Maggie (Family Pack - 400g)': 'maggie_family_pack.jpg',
  'Moongfali': 'moongfali_peanut_250gm.jpg',
  'Soyabean (Packet)': 'soyachunks_fortune_packet.jpg',
  'Soyabean (Open - Small)': 'soyabean_chunks_open_250gm.jpeg',
  'Macaroni / Pasta': 'fusli_pasta_microni_250gm.jpeg',
  'Sugar (Chini)': 'suger_chini_250gm.jpg',
  'Glucose D (200g)': 'glucose_d_small.jpg',
  'Glucose D (400g)': 'glucose_d_large.jpeg',
  'Jam (Small)': 'kissan_mixed_fruit_jam_small.jpeg',
  'Jam (Big)': 'kissan_mixed_fruit_jam_large.jpeg',
  'Colgate (Small)': 'colgate_toothpaste_small.jpg',
  'Colgate (Medium)': 'colgate_toothpaste_large.webp',
  'Colgate (Big)': 'colgate_toothpaste_large.webp',
  'Closeup (Small)': 'close_up_toothpaste.jpg',
  'Closeup (Big)': 'close_up_toothpaste.jpg',
  'Sensodyne Toothpaste': 'sensodine_toothpaste.jpeg',
  'Coffee (Nescafe - 50g)': 'nescafe_coffee_small_packet.webp',
  'Coffee (Nescafe - 100g)': 'nescafe_coffee_medium.jpg',
  'Coffee (Nescafe - 200g)': 'nescafe_coffee_large.jpeg',
  'Mustard Oil (Sarso Tel)': 'sarso_tel_sudhh_ghani_1kg.jpg',
  'Fortune Oil': 'sarso_tel_fortune_1kg.jpg',
  'Garam Masala (Whole)': 'khada_garam_masala_packet.jpeg',
  'Garam Masala (Packet)': 'khada_garam_masala_packet.jpeg',
  'Kacha Chana': 'kacha_chana_250gm.jpg',
  'Makhana': 'makhana_100gm.jpeg',
  'Kaju (Cashew)': 'kaju_100gm.jpg',
  'Pista (Packet)': 'fresh_ pista_packet.jpg',
  'Badam (Almond)': 'badam_100gm.jpg',
  'Lassi (250ml)': 'amul_lassi_250ml_tetrapack_24rupees.jpeg',
  'Buttermilk (200ml)': 'amul_masti_spiced_buttermilk_200ml_14rupees.jpg',
  'Buttermilk (1L)': 'amul_masti_spiced_buttermilk_1lt_65rupees.jpg',
  'Practical File (Physics - 30 Pages)': 'practical_file_physics.jpg',
  'Practical File (Physics - 60 Pages)': 'practical_file_physics.jpg',
  'Practical File (Chemistry - 30 Pages)': 'practical_file_chemistry.jpg',
  'Practical File (Chemistry - 60 Pages)': 'practical_file_chemistry.jpg',
  'Practical File (General - 30 Pages)': 'practical_file_general.jpeg',
  'Practical File (General - 60 Pages)': 'practical_file_general.jpeg',
  'Drawing Book (A3 - 36 pages)': 'engineering_drawing_36page.jpg',
  'Drawing Book (A3 - 56 pages)': 'engineering_drawing_56page.jpg',
  'Pen (Blue, Cheap)': 'elkos_pen_4rupees.jpg',
  'Pen (Black, Cheap)': 'elkos_pen_4rupees.jpg',
  'Pen (Blue, Medium)': 'elkos_pen_5rupees.jpg',
  'Pen (Black, Medium)': 'elkos_pen_5rupees.jpg',
  'Pen (Blue, Good)': 'elkos_pen_10rupees.jpg',
  'Pen (Black, Good)': 'elkos_pen_10rupees.jpg',
  'Pencil': 'natraj_pencil.png',
  'Eraser': 'eraser_apsara.jpg',
  'Sharpener': 'pencil_sharpner_plastic.jpg',
  'A4 Size Pages (500 sheets)': 'a4_size_paper_500pages.jpg',
  'Stapler': 'stapler.jpg',
  'Staple Pins': 'staples_pin_box.jpeg',
  'Sticky Notes': 'sticky_notes_small_packet.jpeg',
  'Fevicol (Small)': 'fevicol_small.jpg',
  'Fevicol (Medium)': 'fevicol_small.jpg',
  'Fevicol (Big)': 'fevicol_small.jpg',
  'Double-Sided Tape (Small)': 'cello_tape_small.jpeg',
  'Double-Sided Tape (Big)': 'cello_tape_small.jpeg',
  'Spiral Notebook (Plain - 100 Pages)': 'spiral_notebook_100pg.jpg',
  'Spiral Notebook (Plain - 200 Pages)': 'spiral_notebook_200pg.jpeg',
  'Spiral Notebook (Lined - 100 Pages)': 'spiral_notebook_100pg.jpg',
  'Register (A4 Rough - 100 Pages)': 'register_a4_rough.jpg',
  'Register (A4 Rough - 200 Pages)': 'register_a4_rough_a4.jpg',
  'Graph Book': 'graph_book.jpg',
  'Cello Tape': 'cello_tape_small.jpeg',
  'Highlighter': 'highlighter.jpeg',
  'Banana': 'fresh_bannana_500gm.webp',
  'Pomegranate (Anaar)': 'pomegranate_anar_500gm.jpg',
  'Mango': 'mango_aam_500gm.jpg',
  'Apple': 'fresh_apple_500gm.jpg',
  // 'Orange (Santara)': 'orange_santara_500gm.jpg',
  'Papaya (Papita)': 'fresh_papaya_1kg.jpg',
  'Kiwi': 'fresh_kiwi_1piece.jpg',
  'Coconut (Nariyal)': 'nariyal_water.webp',
  'Grapes (Angoor)': 'fresh_angoor_250gm.jpg',
  'Eggs (30 pieces)': 'eggs_tray_30_piece_180rupees.jpg',
  'Raw Chicken (500g)': 'raw_chicken_500gm_120rupees.jpg',
};

export const DELIVERY_CHARGE = parseInt(process.env.NEXT_PUBLIC_DELIVERY_CHARGE); // Default to 9 if not set or invalid

export const HOSTEL_OPTIONS = [
  { value: 'BH1', label: 'BH1 (Boys Hostel 1)' },
  { value: 'BH2', label: 'BH2 (Boys Hostel 2)' },
  { value: 'BH3', label: 'BH3 (Boys Hostel 3)' },
  { value: 'GH1', label: 'GH1 (Girls Hostel)' },
];