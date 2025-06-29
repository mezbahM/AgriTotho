import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/generated/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Use require for formidable to avoid CJS/ESM interop issues
    const formidable = require('formidable');
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.id || session.user.role !== UserRole.FARMER) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const form = new formidable.IncomingForm({
        uploadDir: path.join(process.cwd(), 'public', 'uploads'),
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
      });

      form.parse(req, async (err: any, fields: any, files: any) => {
        if (err) {
          console.error('[CROP_POST_ERROR]', err);
          return res.status(500).json({ error: err.message || 'Internal Server Error' });
        }
        const getField = (f: any) => Array.isArray(f) ? f[0] : f;
        const name = getField(fields.name);
        const description = getField(fields.description);
        const area = getField(fields.area);
        const plantingDate = getField(fields.plantingDate);
        const expectedHarvestDate = getField(fields.expectedHarvestDate);
        const status = getField(fields.status);
        const healthStatus = getField(fields.healthStatus);
        let imageUrl = null;
        if (files.image && Array.isArray(files.image) && files.image[0]) {
          const file = files.image[0];
          imageUrl = `/uploads/${path.basename(file.filepath)}`;
        }
        if (!name || !area || !plantingDate || !expectedHarvestDate || !status || !healthStatus) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        const crop = await prisma.crop.create({
          data: {
            name: String(name),
            description: description ? String(description) : '',
            area: parseFloat(area),
            plantingDate: new Date(plantingDate),
            expectedHarvestDate: new Date(expectedHarvestDate),
            status: String(status),
            healthStatus: String(healthStatus),
            imageUrl,
            farmerId: session.user.id,
          },
        });
        return res.status(201).json(crop);
      });
    } catch (error: any) {
      console.error('[CROP_POST_ERROR]', error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.id || session.user.role !== UserRole.FARMER) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id } = req.query;
      if (id) {
        // Fetch a single crop by ID, ensure it belongs to the farmer
        const crop = await prisma.crop.findFirst({
          where: { id: String(id), farmerId: session.user.id },
        });
        if (!crop) return res.status(404).json({ error: 'Crop not found' });
        return res.status(200).json(crop);
      }
      const crops = await prisma.crop.findMany({
        where: { farmerId: session.user.id },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(crops);
    } catch (error: any) {
      console.error('[CROP_GET_ERROR]', error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 