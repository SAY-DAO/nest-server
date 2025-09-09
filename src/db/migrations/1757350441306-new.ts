import { MigrationInterface, QueryRunner } from "typeorm";

export class New1757350441306 implements MigrationInterface {
    name = 'New1757350441306'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP CONSTRAINT "FK_fea86db187949398f8b614f730a"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD CONSTRAINT "FK_fea86db187949398f8b614f730a" FOREIGN KEY ("id") REFERENCES "all_user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP CONSTRAINT "FK_fea86db187949398f8b614f730a"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD CONSTRAINT "FK_fea86db187949398f8b614f730a" FOREIGN KEY ("id") REFERENCES "all_user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP COLUMN "updatedAt"`);
    }

}
