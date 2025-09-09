import { MigrationInterface, QueryRunner } from "typeorm";

export class New1757356989520 implements MigrationInterface {
    name = 'New1757356989520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "need_entity" DROP COLUMN "isBuilder"`);
        await queryRunner.query(`ALTER TABLE "all_user_entity" ADD "isBuilder" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "all_user_entity" DROP COLUMN "isBuilder"`);
        await queryRunner.query(`ALTER TABLE "need_entity" ADD "isBuilder" boolean`);
    }

}
