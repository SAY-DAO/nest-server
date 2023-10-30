import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698320275272 implements MigrationInterface {
    name = 'New1698320275272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" RENAME COLUMN "bioTranslations" TO "bio"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" RENAME COLUMN "bio" TO "bioTranslations"`);
    }

}