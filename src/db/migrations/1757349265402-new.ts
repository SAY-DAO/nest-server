import { MigrationInterface, QueryRunner } from "typeorm";

export class New1757349265402 implements MigrationInterface {
    name = 'New1757349265402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."checkpoint_type_enum" AS ENUM('feature', 'bug-fix', 'hotfix', 'deploy', 'rollback', 'db-migration', 'code-review', 'performance', 'roadmap', 'product-spec', 'user-research', 'qa-approval', 'design', 'ux', 'branding', 'asset-production', 'content-creation', 'copywriting', 'seo', 'social', 'email-campaign', 'paid-ads', 'marketing-campaign', 'growth-experiment', 'customer-support', 'onboarding', 'sales', 'bizdev', 'incident', 'monitoring', 'backup', 'security', 'config-change', 'automation', 'legal', 'finance', 'hr', 'meeting', 'training')`);
        await queryRunner.query(`CREATE TABLE "checkpoint" ("id" uuid NOT NULL, "title" character varying(200) NOT NULL, "description" text, "type" "public"."checkpoint_type_enum" NOT NULL DEFAULT 'feature', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "isConfirmed" boolean NOT NULL DEFAULT false, "confirmedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_fea86db187949398f8b614f730a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "need_entity" ADD "isBuilder" boolean`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD CONSTRAINT "FK_fea86db187949398f8b614f730a" FOREIGN KEY ("id") REFERENCES "all_user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP CONSTRAINT "FK_fea86db187949398f8b614f730a"`);
        await queryRunner.query(`ALTER TABLE "need_entity" DROP COLUMN "isBuilder"`);
        await queryRunner.query(`DROP TABLE "checkpoint"`);
        await queryRunner.query(`DROP TYPE "public"."checkpoint_type_enum"`);
    }

}
