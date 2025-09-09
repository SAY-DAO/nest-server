import { MigrationInterface, QueryRunner } from "typeorm";

export class New1757352648526 implements MigrationInterface {
    name = 'New1757352648526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP CONSTRAINT "FK_fea86db187949398f8b614f730a"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD CONSTRAINT "FK_54b53238a8279826f95be669f8d" FOREIGN KEY ("userId") REFERENCES "all_user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP CONSTRAINT "FK_54b53238a8279826f95be669f8d"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD CONSTRAINT "FK_fea86db187949398f8b614f730a" FOREIGN KEY ("id") REFERENCES "all_user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
