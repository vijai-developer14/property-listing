import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Property Listing API",
      version: "1.0.0",
      description:
        "REST API for a multi-tenant property listing platform — auth, property CRUD, image uploads, search, and buyer-to-owner inquiries.",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description:
            "JWT set as an httpOnly cookie after login. Sent automatically by the browser; in Swagger UI's 'Try it out' you must be logged in via /auth/login in the same browser session for cookie auth to work.",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Something went wrong" },
          },
        },
        User: {
          type: "object",
          properties: {
            user_id: { type: "integer", example: 1 },
            user_name: { type: "string", example: "Vijai Kumar" },
            user_mail: { type: "string", example: "vijai@example.com" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["user_name", "user_mail", "password", "user_number"],
          properties: {
            user_name: { type: "string", example: "Vijai Kumar" },
            user_mail: { type: "string", example: "vijai@example.com" },
            password: { type: "string", format: "password", example: "StrongPass123" },
            user_number: { type: "string", example: "9876543210" },
            user_whatsapp_number: { type: "string", nullable: true, example: "9876543210" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["user_mail", "password"],
          properties: {
            user_mail: { type: "string", example: "vijai@example.com" },
            password: { type: "string", format: "password", example: "StrongPass123" },
          },
        },
        Property: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            property_name: { type: "string", example: "Green Meadows Apartment" },
            address_line: { type: "string", example: "12 Kasturba Nagar Main Rd" },
            location: { type: "string", example: "Adyar" },
            city: { type: "string", example: "Chennai" },
            property_size: { type: "integer", example: 1150 },
            property_price: { type: "integer", example: 8500000 },
            description: { type: "string", example: "Well-ventilated 2BHK close to Adyar bridge." },
            property_bhk: { type: "integer", example: 2 },
            property_type_id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 4 },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        PropertyInput: {
          type: "object",
          required: ["property_name", "city", "property_price", "property_type_id"],
          properties: {
            property_name: { type: "string", example: "Green Meadows Apartment" },
            address_line: { type: "string", example: "12 Kasturba Nagar Main Rd" },
            location: { type: "string", example: "Adyar" },
            city: { type: "string", example: "Chennai" },
            property_size: { type: "integer", example: 1150 },
            property_price: { type: "integer", example: 8500000 },
            description: { type: "string", example: "Well-ventilated 2BHK close to Adyar bridge." },
            property_bhk: { type: "integer", example: 2 },
            property_type_id: { type: "integer", example: 1 },
          },
        },
        PropertyType: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            property_type: { type: "string", example: "Apartment" },
          },
        },
        PropertyImage: {
          type: "object",
          properties: {
            id: { type: "integer", example: 12 },
            image_url: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/v1/property_listing/abc123.jpg" },
            is_primary: { type: "boolean", example: true },
          },
        },
        Inquiry: {
          type: "object",
          properties: {
            id: { type: "integer", example: 7 },
            property_id: { type: "integer", example: 1 },
            property_name: { type: "string", example: "Green Meadows Apartment" },
            sender_name: { type: "string", example: "Arjun R" },
            sender_phone: { type: "string", example: "9876543210" },
            message: { type: "string", example: "I'm interested in this property, is it still available?" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        InquiryInput: {
          type: "object",
          required: ["name", "phone", "message"],
          properties: {
            name: { type: "string", example: "Arjun R" },
            phone: { type: "string", example: "9876543210" },
            message: { type: "string", example: "I'm interested in this property, is it still available?" },
          },
        },
        SearchResult: {
          type: "object",
          properties: {
            properties: {
              type: "array",
              items: { $ref: "#/components/schemas/Property" },
            },
            nextCursor: { type: "string", nullable: true, example: "2025-08-01T10:00:00.000Z" },
            hasMore: { type: "boolean", example: true },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ["./routes/*.ts"], // path is relative to where ts-node/node runs from (server root)
};

export const swaggerSpec = swaggerJsdoc(options);
