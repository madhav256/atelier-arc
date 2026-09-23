// Field definitions for the generic admin editor. `kind` controls the input and how values are serialised.
export const RESOURCE_META = {
  artworks: {
    label: 'Artworks',
    title: (x) => x.title,
    columns: [
      ['title', 'Title'],
      ['artist', 'Artist', (x) => x.artist?.name],
      ['price', 'Price'],
      ['availability', 'Availability'],
      ['published', 'Published'],
    ],
    filters: { availability: ['available', 'reserved', 'sold'], published: ['true', 'false'] },
    bulk: ['publish', 'unpublish', 'feature', 'unfeature'],
    fields: [
      ['title', 'Title', 'text', { required: true }],
      ['artist', 'Artist', 'artist', { required: true }],
      ['category', 'Category', 'text', { required: true }],
      ['medium', 'Medium', 'text', { required: true }],
      ['dimensions.width', 'Width', 'number', { required: true }],
      ['dimensions.height', 'Height', 'number', { required: true }],
      ['dimensions.depth', 'Depth', 'number'],
      ['dimensions.unit', 'Unit', 'select', { options: ['cm', 'in'] }],
      ['year', 'Year', 'number'],
      ['edition', 'Edition', 'text'],
      ['stock', 'Units available', 'number'],
      ['price', 'Price', 'number'],
      ['currency', 'Currency', 'text'],
      ['priceOnRequest', 'Price on request', 'bool'],
      ['availability', 'Availability', 'select', { options: ['available', 'reserved', 'sold'] }],
      ['orientation', 'Orientation', 'select', { options: ['', 'portrait', 'landscape', 'square'] }],
      ['description', 'Description', 'textarea'],
      ['provenance', 'Provenance (one per line)', 'lines'],
      ['exhibitionHistory', 'Exhibition history (one per line)', 'lines'],
      ['condition', 'Condition', 'text'],
      ['certificate', 'Certificate', 'text'],
      ['shipping', 'Shipping note', 'text'],
      ['tags', 'Tags (comma separated)', 'csv'],
      ['style', 'Style (comma separated)', 'csv'],
      ['images', 'Images', 'images'],
      ['video', 'Film', 'video'],
      ['featured', 'Featured', 'bool'],
      ['published', 'Published', 'bool'],
    ],
  },
  artists: {
    label: 'Artists',
    title: (x) => x.name,
    columns: [
      ['name', 'Name'],
      ['location', 'Location'],
      ['featured', 'Featured'],
      ['published', 'Published'],
    ],
    filters: { published: ['true', 'false'], featured: ['true', 'false'] },
    bulk: ['publish', 'unpublish', 'feature', 'unfeature'],
    fields: [
      ['name', 'Name', 'text', { required: true }],
      ['portrait', 'Portrait', 'image'],
      ['biography', 'Biography', 'textarea'],
      ['statement', 'Statement', 'textarea'],
      ['nationality', 'Nationality', 'text'],
      ['location', 'Location', 'text'],
      ['birthYear', 'Birth year', 'number'],
      ['movement', 'Practice / movement', 'text'],
      ['timeline', 'Timeline (one per line: year | title | description)', 'timeline'],
      ['exhibitions', 'Exhibitions (one per line)', 'lines'],
      ['awards', 'Awards (one per line)', 'lines'],
      ['featured', 'Featured', 'bool'],
      ['published', 'Published', 'bool'],
    ],
  },
  collections: {
    label: 'Collections',
    title: (x) => x.name,
    columns: [
      ['name', 'Name'],
      ['order', 'Order'],
      ['published', 'Published'],
    ],
    filters: { published: ['true', 'false'] },
    bulk: ['publish', 'unpublish'],
    fields: [
      ['name', 'Name', 'text', { required: true }],
      ['description', 'Description', 'textarea'],
      ['coverImage', 'Cover image', 'image'],
      ['order', 'Display order', 'number'],
      ['artworks', 'Artwork IDs (one per line)', 'lines'],
      ['published', 'Published', 'bool'],
    ],
  },
  articles: {
    label: 'Journal',
    title: (x) => x.title,
    columns: [
      ['title', 'Title'],
      ['type', 'Type'],
      ['publishedAt', 'Published at'],
      ['published', 'Published'],
    ],
    filters: { published: ['true', 'false'] },
    bulk: ['publish', 'unpublish'],
    fields: [
      ['title', 'Title', 'text', { required: true }],
      ['subtitle', 'Subtitle', 'text'],
      ['coverImage', 'Cover image', 'image'],
      ['author', 'Author', 'text'],
      ['publishedAt', 'Publish date', 'date'],
      ['readingTime', 'Reading time (minutes)', 'number'],
      ['type', 'Type', 'text'],
      ['tags', 'Tags (comma separated)', 'csv'],
      ['content', 'Content (## for headings, blank line between paragraphs)', 'textarea', { rows: 14 }],
      ['relatedArtworks', 'Related artwork IDs (one per line)', 'lines'],
      ['relatedArtists', 'Related artist IDs (one per line)', 'lines'],
      ['published', 'Published', 'bool'],
    ],
  },
  customers: {
    label: 'Customers',
    title: (x) => x.name || x.email,
    columns: [
      ['name', 'Name'],
      ['email', 'Email'],
      ['role', 'Role'],
      ['verified', 'Verified'],
      ['disabled', 'Disabled'],
    ],
    filters: { role: ['customer', 'advisor', 'admin'], disabled: ['true', 'false'] },
    readOnlyCreate: true,
    fields: [
      ['name', 'Name', 'text'],
      ['role', 'Role', 'select', { options: ['customer', 'advisor', 'admin'] }],
      ['verified', 'Email verified', 'bool'],
      ['disabled', 'Account disabled', 'bool'],
    ],
  },
};

const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);

export function toForm(item, fields) {
  const out = {};
  for (const [path, , kind] of fields) {
    const v = get(item, path);
    if (kind === 'lines') out[path] = (v || []).map((x) => (typeof x === 'object' ? x._id : x)).join('\n');
    else if (kind === 'csv') out[path] = (v || []).join(', ');
    else if (kind === 'timeline') out[path] = (v || []).map((t) => [t.year, t.title, t.description].filter((x) => x != null && x !== '').join(' | ')).join('\n');
    else if (kind === 'date') out[path] = v ? String(v).slice(0, 10) : '';
    else if (kind === 'artist') out[path] = v?._id || v || '';
    else if (kind === 'bool') out[path] = Boolean(v);
    else if (kind === 'images') out[path] = v || [];
    else if (kind === 'video') out[path] = v || null;
    else out[path] = v ?? '';
  }
  return out;
}

// Serialise the form back into the API's shape, dropping blank optional values.
export function fromForm(form, fields) {
  const out = {};
  const set = (path, value) => {
    const keys = path.split('.');
    let o = out;
    keys.slice(0, -1).forEach((k) => (o = o[k] ??= {}));
    o[keys.at(-1)] = value;
  };
  for (const [path, , kind] of fields) {
    const v = form[path];
    if (kind === 'number') {
      if (v !== '' && v != null) set(path, Number(v));
      else if (path === 'price') set(path, null);
    } else if (kind === 'lines') set(path, String(v || '').split('\n').map((s) => s.trim()).filter(Boolean));
    else if (kind === 'csv') set(path, String(v || '').split(',').map((s) => s.trim()).filter(Boolean));
    else if (kind === 'timeline')
      set(
        path,
        String(v || '')
          .split('\n')
          .map((line) => line.split('|').map((s) => s.trim()))
          .filter(([year, title]) => year && title)
          .map(([year, title, description]) => ({ year: Number(year), title, ...(description && { description }) })),
      );
    else if (kind === 'bool' || kind === 'images') set(path, v);
    else if (kind === 'video') set(path, v || null);
    else if (kind === 'select' && v === '') continue;
    else if (v !== '' && v != null) set(path, v);
  }
  return out;
}
