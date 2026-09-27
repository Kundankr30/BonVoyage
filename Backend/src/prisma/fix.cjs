const fs = require('fs');
let text = fs.readFileSync('schema.prisma', 'utf8');

text = text.replace(
  'model dry_bulk_freight_rates {\n  @@ignore\n} {',
  'model dry_bulk_freight_rates {'
);

text = text.replace(
  '  @@ignore\n}',
  '  @@id([origin_port, destination_port, vessel_class, date])\n}'
);

text = text.replace(
  '  @@ignore\n}',
  '  @@id([date, record_type, origin_port_id, destination_port_id, vessel_class])\n}'
);

text = text.replace(/model freight_rates \{[\s\S]*?@@ignore[\s\S]*?\}/, match => {
  return match.replace('@@ignore', '@@id([date, origin_port_id, destination_port_id, vessel_class])');
});

text = text.replace(/model dry_bulk_freight_rates \{[\s\S]*?@@ignore[\s\S]*?\}/, match => {
  return match.replace('@@ignore', '@@id([origin_port, destination_port, vessel_class, date])');
});

// Since the introspeted schema puts @@ignore at the end of the models, we can do:
fs.writeFileSync('schema.prisma', text);
