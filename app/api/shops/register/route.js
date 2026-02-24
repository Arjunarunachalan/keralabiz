import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import bcrypt from 'bcryptjs';

const AREAS = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

const CATEGORIES = [
    'Grocery', 'Vegetables & Fruits', 'Meat & Fish', 'Bakery',
    'Pharmacy', 'Electronics', 'Clothing', 'Hardware',
    'Stationery', 'Restaurant', 'Other',
];

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const {
            name, ownerName, phone, whatsapp, area, category,
            description, address, deliveryInfo, subscriptionPlan, password,
            imageUrl, deliveryAvailable, minDeliveryAmount
        } = body;

        // Validation
        if (!name || !ownerName || !phone || !whatsapp || !area || !category || !password) {
            return Response.json({ error: 'All required fields must be filled' }, { status: 400 });
        }

        if (password.length < 6) {
            return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Check duplicate phone
        const existing = await Shop.findOne({ phone });
        if (existing) {
            return Response.json({ error: 'A shop with this phone number already exists' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const shop = await Shop.create({
            name: name.trim(),
            ownerName: ownerName.trim(),
            phone: phone.trim(),
            whatsapp: whatsapp.trim(),
            area,
            category,
            description: description || '',
            address: address || '',
            deliveryInfo: deliveryInfo || '',
            imageUrl: imageUrl || '',
            deliveryAvailable: !!deliveryAvailable,
            minDeliveryAmount: Number(minDeliveryAmount) || 0,
            subscriptionPlan: subscriptionPlan || 'basic',
            status: 'PENDING',
            passwordHash,
        });

        return Response.json(
            {
                success: true,
                message: 'Registration submitted! Admin will review your application within 24-48 hours.',
                shopId: shop._id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Shop registration error:', error);
        return Response.json({ error: 'Server error. Please try again.' }, { status: 500 });
    }
}
