import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export default fp(async (app) => {
  const secret = app.config.JWT_SECRET as string;
  await app.register(jwt, { secret });

  app.decorate("authenticate", async (req: any, reply: any) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: any, reply: any) => Promise<void>;
  }
  interface FastifyRequest {
    user: { sub: string; email: string };
  }
  interface FastifyInstance {
    config: {
      JWT_SECRET: string;
    };
  }
}
