import { db } from '@/db';
import { orderItems } from '@/db/schema';

async function main() {
    const sampleOrderItems = [
        // Order 1: 2 products (Rice + Beans)
        {
            orderId: 1,
            productId: 1,
            quantity: 50,
            pricePerUnit: "45000.00",
            totalPrice: "2250000.00",
            createdAt: "2024-01-15T10:00:00Z",
        },
        {
            orderId: 1,
            productId: 5,
            quantity: 30,
            pricePerUnit: "55000.00",
            totalPrice: "1650000.00",
            createdAt: "2024-01-15T10:00:00Z",
        },
        
        // Order 2: 1 product (Cassava)
        {
            orderId: 2,
            productId: 3,
            quantity: 80,
            pricePerUnit: "18000.00",
            totalPrice: "1440000.00",
            createdAt: "2024-01-16T09:30:00Z",
        },
        
        // Order 3: 3 products (Tomatoes + Pepper + Onions)
        {
            orderId: 3,
            productId: 6,
            quantity: 100,
            pricePerUnit: "12000.00",
            totalPrice: "1200000.00",
            createdAt: "2024-01-17T11:15:00Z",
        },
        {
            orderId: 3,
            productId: 7,
            quantity: 50,
            pricePerUnit: "15000.00",
            totalPrice: "750000.00",
            createdAt: "2024-01-17T11:15:00Z",
        },
        {
            orderId: 3,
            productId: 8,
            quantity: 60,
            pricePerUnit: "8000.00",
            totalPrice: "480000.00",
            createdAt: "2024-01-17T11:15:00Z",
        },
        
        // Order 4: 4 products (Plantain + Yam + Groundnut + Palm Oil)
        {
            orderId: 4,
            productId: 4,
            quantity: 70,
            pricePerUnit: "25000.00",
            totalPrice: "1750000.00",
            createdAt: "2024-01-18T14:20:00Z",
        },
        {
            orderId: 4,
            productId: 2,
            quantity: 40,
            pricePerUnit: "32000.00",
            totalPrice: "1280000.00",
            createdAt: "2024-01-18T14:20:00Z",
        },
        {
            orderId: 4,
            productId: 10,
            quantity: 30,
            pricePerUnit: "48000.00",
            totalPrice: "1440000.00",
            createdAt: "2024-01-18T14:20:00Z",
        },
        {
            orderId: 4,
            productId: 9,
            quantity: 25,
            pricePerUnit: "85000.00",
            totalPrice: "2125000.00",
            createdAt: "2024-01-18T14:20:00Z",
        },
        
        // Order 5: 2 products (Maize + Millet)
        {
            orderId: 5,
            productId: 11,
            quantity: 60,
            pricePerUnit: "38000.00",
            totalPrice: "2280000.00",
            createdAt: "2024-01-19T08:45:00Z",
        },
        {
            orderId: 5,
            productId: 12,
            quantity: 40,
            pricePerUnit: "42000.00",
            totalPrice: "1680000.00",
            createdAt: "2024-01-19T08:45:00Z",
        },
        
        // Order 6: 3 products (Ginger + Garlic + Cucumber)
        {
            orderId: 6,
            productId: 13,
            quantity: 50,
            pricePerUnit: "65000.00",
            totalPrice: "3250000.00",
            createdAt: "2024-01-20T13:10:00Z",
        },
        {
            orderId: 6,
            productId: 14,
            quantity: 35,
            pricePerUnit: "72000.00",
            totalPrice: "2520000.00",
            createdAt: "2024-01-20T13:10:00Z",
        },
        {
            orderId: 6,
            productId: 15,
            quantity: 80,
            pricePerUnit: "6000.00",
            totalPrice: "480000.00",
            createdAt: "2024-01-20T13:10:00Z",
        },
        
        // Order 7: 2 products (Carrot + Cabbage)
        {
            orderId: 7,
            productId: 16,
            quantity: 70,
            pricePerUnit: "9000.00",
            totalPrice: "630000.00",
            createdAt: "2024-01-21T10:30:00Z",
        },
        {
            orderId: 7,
            productId: 17,
            quantity: 60,
            pricePerUnit: "7500.00",
            totalPrice: "450000.00",
            createdAt: "2024-01-21T10:30:00Z",
        },
        
        // Order 8: 3 products (Watermelon + Pineapple + Coconut)
        {
            orderId: 8,
            productId: 18,
            quantity: 40,
            pricePerUnit: "15000.00",
            totalPrice: "600000.00",
            createdAt: "2024-01-22T15:00:00Z",
        },
        {
            orderId: 8,
            productId: 19,
            quantity: 50,
            pricePerUnit: "8000.00",
            totalPrice: "400000.00",
            createdAt: "2024-01-22T15:00:00Z",
        },
        {
            orderId: 8,
            productId: 20,
            quantity: 100,
            pricePerUnit: "3500.00",
            totalPrice: "350000.00",
            createdAt: "2024-01-22T15:00:00Z",
        },
        
        // Order 9: 2 products (Rice + Tomatoes)
        {
            orderId: 9,
            productId: 1,
            quantity: 45,
            pricePerUnit: "45000.00",
            totalPrice: "2025000.00",
            createdAt: "2024-01-23T09:20:00Z",
        },
        {
            orderId: 9,
            productId: 6,
            quantity: 75,
            pricePerUnit: "12000.00",
            totalPrice: "900000.00",
            createdAt: "2024-01-23T09:20:00Z",
        },
        
        // Order 10: 4 products (Yam + Beans + Plantain + Palm Oil)
        {
            orderId: 10,
            productId: 2,
            quantity: 55,
            pricePerUnit: "32000.00",
            totalPrice: "1760000.00",
            createdAt: "2024-01-24T11:45:00Z",
        },
        {
            orderId: 10,
            productId: 5,
            quantity: 35,
            pricePerUnit: "55000.00",
            totalPrice: "1925000.00",
            createdAt: "2024-01-24T11:45:00Z",
        },
        {
            orderId: 10,
            productId: 4,
            quantity: 60,
            pricePerUnit: "25000.00",
            totalPrice: "1500000.00",
            createdAt: "2024-01-24T11:45:00Z",
        },
        {
            orderId: 10,
            productId: 9,
            quantity: 20,
            pricePerUnit: "85000.00",
            totalPrice: "1700000.00",
            createdAt: "2024-01-24T11:45:00Z",
        },
        
        // Order 11: 2 products (Pepper + Onions)
        {
            orderId: 11,
            productId: 7,
            quantity: 65,
            pricePerUnit: "15000.00",
            totalPrice: "975000.00",
            createdAt: "2024-01-25T08:00:00Z",
        },
        {
            orderId: 11,
            productId: 8,
            quantity: 70,
            pricePerUnit: "8000.00",
            totalPrice: "560000.00",
            createdAt: "2024-01-25T08:00:00Z",
        },
        
        // Order 12: 3 products (Cassava + Groundnut + Maize)
        {
            orderId: 12,
            productId: 3,
            quantity: 90,
            pricePerUnit: "18000.00",
            totalPrice: "1620000.00",
            createdAt: "2024-01-26T12:30:00Z",
        },
        {
            orderId: 12,
            productId: 10,
            quantity: 25,
            pricePerUnit: "48000.00",
            totalPrice: "1200000.00",
            createdAt: "2024-01-26T12:30:00Z",
        },
        {
            orderId: 12,
            productId: 11,
            quantity: 50,
            pricePerUnit: "38000.00",
            totalPrice: "1900000.00",
            createdAt: "2024-01-26T12:30:00Z",
        },
        
        // Order 13: 4 products (Ginger + Garlic + Cucumber + Carrot)
        {
            orderId: 13,
            productId: 13,
            quantity: 40,
            pricePerUnit: "65000.00",
            totalPrice: "2600000.00",
            createdAt: "2024-01-27T14:15:00Z",
        },
        {
            orderId: 13,
            productId: 14,
            quantity: 30,
            pricePerUnit: "72000.00",
            totalPrice: "2160000.00",
            createdAt: "2024-01-27T14:15:00Z",
        },
        {
            orderId: 13,
            productId: 15,
            quantity: 70,
            pricePerUnit: "6000.00",
            totalPrice: "420000.00",
            createdAt: "2024-01-27T14:15:00Z",
        },
        {
            orderId: 13,
            productId: 16,
            quantity: 50,
            pricePerUnit: "9000.00",
            totalPrice: "450000.00",
            createdAt: "2024-01-27T14:15:00Z",
        },
        
        // Order 14: 2 products (Cabbage + Watermelon)
        {
            orderId: 14,
            productId: 17,
            quantity: 80,
            pricePerUnit: "7500.00",
            totalPrice: "600000.00",
            createdAt: "2024-01-28T10:00:00Z",
        },
        {
            orderId: 14,
            productId: 18,
            quantity: 35,
            pricePerUnit: "15000.00",
            totalPrice: "525000.00",
            createdAt: "2024-01-28T10:00:00Z",
        },
        
        // Order 15: 3 products (Pineapple + Coconut + Millet)
        {
            orderId: 15,
            productId: 19,
            quantity: 60,
            pricePerUnit: "8000.00",
            totalPrice: "480000.00",
            createdAt: "2024-01-29T13:45:00Z",
        },
        {
            orderId: 15,
            productId: 20,
            quantity: 90,
            pricePerUnit: "3500.00",
            totalPrice: "315000.00",
            createdAt: "2024-01-29T13:45:00Z",
        },
        {
            orderId: 15,
            productId: 12,
            quantity: 45,
            pricePerUnit: "42000.00",
            totalPrice: "1890000.00",
            createdAt: "2024-01-29T13:45:00Z",
        },
    ];

    await db.insert(orderItems).values(sampleOrderItems);
    
    console.log('✅ Order items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});