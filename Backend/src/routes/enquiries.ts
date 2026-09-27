import { Router } from 'express';
import { db } from '../prisma/db';

export const enquiriesRouter = Router();
enquiriesRouter.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const whereClause: any = {};
    if (type) {
      whereClause.enquiry_type = String(type);
    }
    
    const enquiries = await db.enquiries.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
    });
    
    res.json(enquiries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
enquiriesRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const enquiry = await db.enquiries.create({
      data: {
        enquiry_type: data.enquiry_type,
        commodity: data.commodity,
        cargo_quantity_tons: data.cargo_quantity_tons ? Number(data.cargo_quantity_tons) : null,
        preferred_vessel: data.preferred_vessel,
        origin_port: data.origin_port,
        destination_port: data.destination_port,
        laycan_start: data.laycan_start ? new Date(data.laycan_start) : null,
        laycan_end: data.laycan_end ? new Date(data.laycan_end) : null,
      },
    });
    res.json(enquiry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/enquiries/:id - Update enquiry status
enquiriesRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const enquiry = await db.enquiries.update({
      where: { enquiry_id: Number(id) },
      data: { status },
    });
    
    res.json(enquiry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
