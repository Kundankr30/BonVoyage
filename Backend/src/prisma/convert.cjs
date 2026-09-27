const fs = require('fs');

let content = fs.readFileSync('contract.prisma', 'utf8');

// Replace top comments
content = content.replace('// use prisma-8', 'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n');
content = content.replace('// Contract inferred from the live database schema. Edit as needed, then run `prisma contract emit`.', '');

// Replace types
content = content.replace(/VarChar\(\d+\)/g, 'String');
content = content.replace(/Numeric\(\d+,\s*\d+\)/g, 'Decimal');
content = content.replace(/Date/g, 'DateTime');
content = content.replace(/Timestamp\(\d+\)/g, 'DateTime');

// Fix models missing ID (DryBulkFreightRates)
content = content.replace(
  'model DryBulkFreightRates {\n  date                 DateTime\n  originPort           String   @map("origin_port")\n  destinationPort      String   @map("destination_port")\n  vesselClass          String    @map("vessel_class")\n  freightRateUsdPerTon Decimal @map("freight_rate_usd_per_ton")',
  'model DryBulkFreightRates {\n  date                 DateTime\n  originPort           String   @map("origin_port")\n  destinationPort      String   @map("destination_port")\n  vesselClass          String    @map("vessel_class")\n  freightRateUsdPerTon Decimal @map("freight_rate_usd_per_ton")\n\n  @@id([originPort, destinationPort, vesselClass, date])'
);

// Fix models missing ID (FreightRates)
content = content.replace(
  'model FreightRates {\n  date              DateTime\n  recordType        String?    @map("record_type")\n  code              String?',
  'model FreightRates {\n  date              DateTime @id\n  recordType        String?    @map("record_type")\n  code              String?'
);

fs.writeFileSync('schema.prisma', content);
