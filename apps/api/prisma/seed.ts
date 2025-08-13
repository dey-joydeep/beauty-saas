import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper function to generate random coordinates within a radius
function generateRandomCoordinates(center, radiusInKm) {
  const earthRadius = 6371; // km
  const y0 = center.lat * Math.PI / 180;
  const x0 = center.lng * Math.PI / 180;
  
  // Random distance in km within the radius
  const distance = Math.random() * radiusInKm;
  
  // Random angle in radians
  const angle = Math.random() * 2 * Math.PI;
  
  // Calculate new coordinates
  const y1 = Math.asin(
    Math.sin(y0) * Math.cos(distance / earthRadius) +
    Math.cos(y0) * Math.sin(distance / earthRadius) * Math.cos(angle)
  );
  
  const x1 = x0 + Math.atan2(
    Math.sin(angle) * Math.sin(distance / earthRadius) * Math.cos(y0),
    Math.cos(distance / earthRadius) - Math.sin(y0) * Math.sin(y1)
  );
  
  return {
    lat: y1 * 180 / Math.PI,
    lng: x1 * 180 / Math.PI
  };
}

async function main() {
  // Create roles
  const roles = [
    { name: 'saas_owner' },
    { name: 'salon_owner' },
    { name: 'salon_staff' },
    { name: 'customer' }
  ];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role
    });
  }

  // Create languages
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' }
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang
    });
  }

  // Create countries and cities
  const countries = [
    {
      name: 'Japan',
      iso2: 'JP',
      iso3: 'JPN',
      phoneCode: '81',
      capital: 'Tokyo',
      currency: 'JPY',
      native: '日本',
      emoji: '🇯🇵',
      emojiU: 'U+1F1EF U+1F1F5',
      states: [
        {
          name: 'Tokyo',
          stateCode: '13',
          latitude: '35.6762',
          longitude: '139.6503',
          cities: [
            { name: 'Shibuya', latitude: '35.6580', longitude: '139.7016' },
            { name: 'Shinjuku', latitude: '35.6938', longitude: '139.7035' },
            { name: 'Ginza', latitude: '35.6716', longitude: '139.7639' }
          ]
        },
        {
          name: 'Osaka',
          stateCode: '27',
          latitude: '34.6937',
          longitude: '135.5023',
          cities: [
            { name: 'Osaka', latitude: '34.6937', longitude: '135.5023' },
            { name: 'Suita', latitude: '34.7614', longitude: '135.5156' },
            { name: 'Toyonaka', latitude: '34.7815', longitude: '135.4695' }
          ]
        }
      ]
    },
    {
      name: 'Bangladesh',
      iso2: 'BD',
      iso3: 'BGD',
      phoneCode: '880',
      capital: 'Dhaka',
      currency: 'BDT',
      native: 'বাংলাদেশ',
      emoji: '🇧🇩',
      emojiU: 'U+1F1E7 U+1F1E9',
      states: [
        {
          name: 'Dhaka',
          stateCode: '13',
          latitude: '23.8103',
          longitude: '90.4125',
          cities: [
            { name: 'Dhaka', latitude: '23.8103', longitude: '90.4125' },
            { name: 'Savar', latitude: '23.8628', longitude: '90.2667' },
            { name: 'Narayanganj', latitude: '23.6102', longitude: '90.4996' }
          ]
        },
        {
          name: 'Chittagong',
          stateCode: '10',
          latitude: '22.3569',
          longitude: '91.7832',
          cities: [
            { name: 'Chittagong', latitude: '22.3569', longitude: '91.7832' },
            { name: 'Cox\'s Bazar', latitude: '21.4272', longitude: '92.0058' },
            { name: 'Comilla', latitude: '23.4607', longitude: '91.1809' }
          ]
        }
      ]
    }
  ];

  // Save countries, states, and cities
  for (const countryData of countries) {
    const { states, ...country } = countryData;
    const savedCountry = await prisma.country.upsert({
      where: { iso2: country.iso2 },
      update: {},
      create: country
    });

    for (const stateData of states) {
      const { cities, ...state } = stateData;
      const savedState = await prisma.state.upsert({
        where: { countryId_stateCode: { countryId: savedCountry.id, stateCode: state.stateCode } },
        update: {},
        create: {
          ...state,
          countryId: savedCountry.id
        }
      });

      // for (const cityData of cities) {
      //   await prisma.city.upsert({
      //     where: { 
      //       name_countryId: { 
      //         name: cityData.name, 
      //         countryId: savedCountry.id 
      //       } 
      //     },
      //     update: {},
      //     create: {
      //       ...cityData,
      //       stateId: savedState.id,
      //       countryId: savedCountry.id
      //     }
      //   });
      // }
    }
  }

  // Create a test tenant
  const tenant = await prisma.tenant.upsert({
    where: { email: 'test-tenant@example.com' },
    update: {},
    create: {
      name: 'Test Tenant',
      email: 'test-tenant@example.com',
      phone: '000-0000',
      // address: '123 Test St.'
    }
  });

  // Create a SaaS owner user (upsert)
  const saasOwnerUser = await prisma.user.upsert({
    where: { email: 'saasowner@example.com' },
    update: {},
    create: {
      name: 'SaaS Owner',
      email: 'saasowner@example.com',
      passwordHash: 'hashedpassword',
      tenantId: tenant.id,
      isVerified: true,
      roles: { create: [{ role: { connect: { name: 'saas_owner' } } }] },
      saasOwner: { create: { permissions: ['manage_tenants'], managedTenants: [tenant.id] } }
    }
  });

  // Get all cities for salon creation
  const allCities = await prisma.city.findMany({
    include: {
      state: {
        include: {
          country: true
        }
      }
    }
  });

  // Create 100 sample salons
  const salonNames = [
    'Glamour Studio', 'Elegance Spa', 'Chic Cuts', 'Luxury Nails', 'Royal Beauty',
    'Serene Spa', 'Urban Style', 'Elite Salon', 'Divine Beauty', 'Posh Parlor',
    'Tranquil Touch', 'Vogue Studio', 'Bella Vita', 'Zen Spa', 'Charm & Glow',
    'Luxe Beauty', 'The Hair Studio', 'Pure Skin', 'Ethereal Beauty', 'Bliss Spa'
  ];

  const salonTypes = [
    'Hair Salon', 'Nail Salon', 'Spa', 'Barber Shop', 'Beauty Salon',
    'Hair & Nails', 'Full Service Salon', 'Luxury Spa', 'Hair Studio', 'Beauty Bar'
  ];

  const salonServices = [
    ['Haircut', 'Coloring', 'Styling'],
    ['Manicure', 'Pedicure', 'Nail Art'],
    ['Facial', 'Massage', 'Body Treatment'],
    ['Haircut', 'Shave', 'Beard Trim'],
    ['Makeup', 'Hair Styling', 'Bridal'],
    ['Waxing', 'Facials', 'Body Treatments'],
    ['Hair Extensions', 'Keratin Treatment', 'Perm'],
    ['Eyelash Extensions', 'Microblading', 'Brow Lamination'],
    ['Massage', 'Aromatherapy', 'Hot Stone Therapy'],
    ['Hair Treatment', 'Scalp Treatment', 'Hair Spa']
  ];

  // Create 100 salons
  for (let i = 0; i < 100; i++) {
    const city = faker.helpers.arrayElement(allCities);
    const salonType = faker.helpers.arrayElement(salonTypes);
    const salonName = `${faker.helpers.arrayElement(salonNames)} ${faker.helpers.arrayElement([salonType, ''])}`.trim();
    const services = faker.helpers.arrayElement(salonServices);
    
    // Generate random coordinates near the city center
    const { lat, lng } = generateRandomCoordinates(
      { lat: parseFloat(city.latitude || '0'), lng: parseFloat(city.longitude || '0') },
      10 // within 10km radius
    );

    const salon = await prisma.salon.create({
      data: {
        name: salonName,
        tenantId: tenant.id,
        // address: `${faker.location.streetAddress()}, ${city.name}, ${city.state?.country.name}`,
        // zipCode: faker.location.zipCode(),
        // city: city.name,
        // latitude: lat,
        // longitude: lng,
        ownerId: saasOwnerUser.id,
        // services: services,
        imageUrl: faker.image.urlLoremFlickr({ category: 'salon' }),
        translations: {
          create: [
            {
              language: { connect: { code: 'en' } },
              name: salonName,
              description: `A premium ${salonType.toLowerCase()} offering top-notch services in ${city.name}.`,
              address: `${faker.location.streetAddress()}, ${city.name}, ${city.state?.country.name}`
            },
            {
              language: { connect: { code: 'ja' } },
              name: `${salonName} (日本語)`,
              description: `${city.name}で高品質な${salonType}サービスを提供するサロンです。`,
              address: `${faker.location.streetAddress()}, ${city.name}, ${city.state?.country.name}`
            },
            {
              language: { connect: { code: 'bn' } },
              name: `${salonName} (বাংলা)`,
              description: `${city.name} এ অবস্থিত একটি প্রিমিয়াম ${salonType.toLowerCase()} যেখানে সেরা সেবা প্রদান করা হয়।`,
              address: `${faker.location.streetAddress()}, ${city.name}, ${city.state?.country.name}`
            }
          ]
        }
      }
    });

    // Create some sample reviews
    const reviewCount = faker.number.int({ min: 5, max: 50 });
    for (let j = 0; j < reviewCount; j++) {
      // await prisma.review.create({
      //   data: {
      //     rating: faker.number.float({ min: 1, max: 5, multipleOf: 0.5 }),
      //     comment: faker.lorem.sentences(2),
      //     salonId: salon.id,
      //     userId: customerUser.id,
      //     createdAt: faker.date.past({ years: 1 })
      //   }
      // });
    }
  }

  // Get the first salon for staff assignment
  const salon = await prisma.salon.findFirstOrThrow({
    where: { tenantId: tenant.id }
  });

  // Create multiple salon staff users
  const staffPositions = ['Stylist', 'Manager', 'Therapist', 'Nail Technician', 'Receptionist'];
  const staffCount = faker.number.int({ min: 3, max: 10 });
  
  for (let i = 0; i < staffCount; i++) {
    const position = faker.helpers.arrayElement(staffPositions);
    const email = `staff${i+1}@example.com`;
    
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: faker.person.fullName(),
        email,
        passwordHash: 'hashedpassword',
        tenantId: tenant.id,
        isVerified: true,
        // roles: { create: [{ role: { connect: { name: 'salon_staff' } }] },
        salonStaff: { 
          create: { 
            salonId: salon.id, 
            position,
            isActive: true, 
            // hiredAt: faker.date.past({ years: 2 }),
          } 
        }
      }
    });
  }
  
  // Create a salon staff user (upsert)
  const salonStaffUser = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      name: 'Salon Staff',
      email: 'staff@example.com',
      passwordHash: 'hashedpassword',
      tenantId: tenant.id,
      isVerified: true,
      roles: { create: [{ role: { connect: { name: 'salon_staff' } } }] },
      salonStaff: { create: { salonId: salon.id, position: 'stylist', isActive: true} }
    }
  });

  // Create multiple customer users
  const customerCount = faker.number.int({ min: 20, max: 100 });
  
  for (let i = 0; i < customerCount; i++) {
    const email = `customer${i+1}@example.com`;
    
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: faker.person.fullName(),
        email,
        passwordHash: 'hashedpassword',
        tenantId: tenant.id,
        isVerified: true,
        // roles: { create: [{ role: { connect: { name: 'customer' } }] },
        customer: { 
          create: { 
            loyaltyPoints: faker.number.int({ min: 0, max: 1000 }),
            registeredAt: faker.date.past({ years: 2 }),
            // preferences: {
            //   notifications: faker.datatype.boolean(),
            //   marketingEmails: faker.datatype.boolean(),
            //   preferredLanguage: faker.helpers.arrayElement(['en', 'ja', 'bn'])
            // },
            // address: faker.location.streetAddress(),
            // phone: faker.phone.number()
          } 
        }
      }
    });
  }
  
  // Create a customer user (upsert)
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Customer',
      email: 'customer@example.com',
      passwordHash: 'hashedpassword',
      tenantId: tenant.id,
      isVerified: true,
      roles: { create: [{ role: { connect: { name: 'customer' } } }] },
      customer: { create: { loyaltyPoints: 100, registeredAt: new Date() } }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    // Use globalThis.process for compatibility with ts-node
    (globalThis as any).process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
