import { getCurrentCustomer } from "@/lib/auth";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return Response.json({ customer: null });
    }

    return Response.json({
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        role: customer.role,
        phone: customer.phone,
        isVerified: customer.isVerified,
      },
    });
  } catch (error) {
    console.error("[ME_ERROR]", error);
    return Response.json({ error: "Ein interner Fehler ist aufgetreten." }, { status: 500 });
  }
}
