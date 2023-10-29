import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698395142941 implements MigrationInterface {
    name = 'New1698395142941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "provider_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "website" character varying, "description" character varying, "address" character varying, "city" integer NOT NULL, "state" integer NOT NULL, "country" integer NOT NULL, "type" integer NOT NULL, "typeName" character varying NOT NULL, "logoUrl" character varying, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_ddb6a817b511ba57dd7e37b2fe9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ethereum_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "transactionHash" character varying, "transactionStatus" character varying, "createdTimestamp" TIMESTAMP, "submittedTimestamp" TIMESTAMP, "signedTimestamp" TIMESTAMP, "abortedTimestamp" TIMESTAMP, "failedTimestamp" TIMESTAMP, "minedTimestamp" TIMESTAMP, "failureReason" character varying, "to" character varying, "from" character varying, "value" character varying, "data" character varying, "gasUsed" character varying, "fees" character varying, "gasLimit" character varying, "gasPrice" character varying, "maxPriorityFeePerGas" character varying, "maxFeePerGas" character varying, "network" character varying, "nonce" character varying, "signedRawTransaction" character varying, "userId" character varying, "needId" uuid, "type" character varying, "ethereumAccountId" uuid, CONSTRAINT "PK_f2cbd054cbcf4809aa6c063ea27" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ethereum_account_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "address" character varying NOT NULL, "chainId" integer, "userId" uuid, CONSTRAINT "PK_1a216abef79e89a968c35b245ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ticket_content_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "message" character varying NOT NULL, "from" integer NOT NULL, "announcement" integer, "announcedArrivalDate" TIMESTAMP WITH TIME ZONE, "ticketId" uuid, CONSTRAINT "PK_9d34c3ab31b22603cb7d80bbf6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ticket_view_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskUserId" integer NOT NULL, "ticketId" uuid NOT NULL, "viewed" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_7fe9795a701fcf5007efbb05aea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ticket_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "role" integer, "color" integer NOT NULL, "title" character varying, "flaskUserId" integer NOT NULL, "flaskNeedId" integer NOT NULL, "lastAnnouncement" integer, "needId" uuid NOT NULL, CONSTRAINT "PK_4c23bb38e4d566808a73a5af6ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bee0cca5348046f06053b7a6e5" ON "ticket_entity" ("flaskUserId") `);
        await queryRunner.query(`CREATE TABLE "children_pre_register_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "awakeUrl" character varying NOT NULL, "sleptUrl" character varying NOT NULL, "sayName" hstore NOT NULL, "firstName" hstore, "lastName" hstore, "bio" character varying, "birthDate" TIMESTAMP WITH TIME ZONE, "birthPlace" integer, "city" integer, "state" integer, "country" integer, "sex" integer, "education" integer, "housingStatus" integer, "flaskSwId" integer, "address" character varying, "familyCount" integer, "phoneNumber" character varying, "flaskNgoId" integer, "voiceUrl" character varying, "isApproved" boolean DEFAULT false, "locationId" uuid, CONSTRAINT "PK_a06984f3a83b097b1dc2c8bf2a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "location_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskCityId" integer NOT NULL, "name" character varying, "stateId" integer, "stateCode" character varying, "stateName" character varying, "countryId" integer, "countryCode" character varying, "countryName" character varying, "latitude" character varying, "longitude" character varying, CONSTRAINT "PK_9debf81cdf142d284fce9b8fd7b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ngo_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskNgoId" integer, "name" character varying, "website" character varying, "flaskCityId" integer, "flaskStateId" integer, "flaskCountryId" integer, "postalAddress" character varying, "emailAddress" character varying, "phoneNumber" character varying, "logoUrl" character varying, "isActive" boolean NOT NULL DEFAULT false, "registerDate" TIMESTAMP WITH TIME ZONE, "created" TIMESTAMP WITH TIME ZONE, "updated" TIMESTAMP WITH TIME ZONE, "isDeleted" boolean, "locationId" uuid, CONSTRAINT "PK_3111eb08ec402c3eec998fca624" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_03fd2e6f1edd77c3e649d3c12b" ON "ngo_entity" ("flaskNgoId") `);
        await queryRunner.query(`CREATE TABLE "ngo_arrival_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "arrivalCode" character varying NOT NULL, "deliveryCode" character varying NOT NULL, "website" character varying, "ngoId" uuid, CONSTRAINT "PK_dadcff508fd11aba151e8446156" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."contributor_entity_panelrole_enum" AS ENUM('0', '1', '2', '3', '4')`);
        await queryRunner.query(`CREATE TABLE "contributor_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskUserId" integer NOT NULL, "flaskNgoId" integer NOT NULL, "panelRole" "public"."contributor_entity_panelrole_enum" NOT NULL, "panelRoleName" character varying NOT NULL, "ngoId" uuid, "userId" uuid, CONSTRAINT "PK_0e44dd1e9f237efa30c5d261e0a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."signature_entity_role_enum" AS ENUM('-2', '-1', '0', '1', '2', '3', '4', '7', '8')`);
        await queryRunner.query(`CREATE TABLE "signature_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "verifyingContract" character varying NOT NULL, "isVerified" boolean DEFAULT false, "signerAddress" character varying NOT NULL, "flaskUserId" integer NOT NULL, "flaskNeedId" integer NOT NULL, "hash" character varying NOT NULL, "role" "public"."signature_entity_role_enum" NOT NULL, "userId" uuid NOT NULL, "needId" uuid NOT NULL, CONSTRAINT "UQ_f6e5ed5d345f52ae435fb6931bf" UNIQUE ("hash"), CONSTRAINT "PK_4783e9e8a055a8fc1befb2b505e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "vRole" integer, "content" character varying, "flaskUserId" integer NOT NULL, "flaskNeedId" integer NOT NULL, "needId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_5a439a16c76d63e046765cdb84f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "all_user_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskUserId" integer NOT NULL, "typeId" integer, "isContributor" boolean NOT NULL, "userName" character varying, "firstName" character varying, "lastName" character varying, "avatarUrl" character varying, "birthDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_dd13d1c337b6737e2645211de0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskId" integer, "creditAmount" integer, "orderId" character varying, "donationAmount" integer, "cardNumber" character varying, "gatewayPaymentId" character varying, "gatewayTrackId" character varying, "needAmount" integer, "transactionDate" TIMESTAMP WITH TIME ZONE, "created" TIMESTAMP WITH TIME ZONE, "updated" TIMESTAMP WITH TIME ZONE, "verified" TIMESTAMP WITH TIME ZONE, "flaskNeedId" integer NOT NULL, "flaskUserId" integer NOT NULL, "needId" uuid, "familyMemberId" uuid, CONSTRAINT "PK_6c397c81035bd5b42d16ef3bc70" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2dbfe67b6b48602609e1619f72" ON "payment_entity" ("flaskId") `);
        await queryRunner.query(`CREATE TABLE "receipt_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskReceiptId" integer, "flaskNeedId" integer NOT NULL, "flaskSwId" integer NOT NULL, "attachment" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying, "code" character varying, "needStatus" integer, "deleted" TIMESTAMP, "needId" uuid, CONSTRAINT "PK_9e35eb3a8cb152eace0f149242a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_908a989fd5680fc920da668472" ON "receipt_entity" ("flaskReceiptId") `);
        await queryRunner.query(`CREATE TABLE "status_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskId" integer, "swId" integer, "flaskNeedId" integer, "newStatus" integer, "oldStatus" integer, "needId" uuid, CONSTRAINT "PK_ff91c3dc49aee4d7911093467cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_81d9eb1ba2e8039c6f4cc29abe" ON "status_entity" ("flaskId") `);
        await queryRunner.query(`CREATE TABLE "ipfs_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskNeedId" integer NOT NULL, "needDetailsHash" character varying NOT NULL, "receiptsHash" character varying, "paymentsHash" character varying, "needId" uuid NOT NULL, CONSTRAINT "REL_0c54e50c9105e9f7e0e528fcd0" UNIQUE ("needId"), CONSTRAINT "PK_c3904d860c474f189217bab6a3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "variable_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskUserId" integer NOT NULL, "distanceRatio" numeric(10,2) NOT NULL DEFAULT '0', "difficultyRatio" numeric(10,2) NOT NULL DEFAULT '0', "contributionRatio" numeric(10,2) NOT NULL DEFAULT '0', "needFlaskId" integer NOT NULL, "needId" uuid, CONSTRAINT "PK_2b518bfd4b9aea8ca0515777e96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."need_entity_category_enum" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`CREATE TYPE "public"."need_entity_type_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "need_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskId" integer, "title" character varying, "name" character varying, "doingDuration" integer, "affiliateLinkUrl" character varying, "bankTrackId" character varying, "category" "public"."need_entity_category_enum", "childDeliveryDate" TIMESTAMP WITH TIME ZONE, "confirmDate" TIMESTAMP WITH TIME ZONE, "cost" integer, "created" TIMESTAMP WITH TIME ZONE, "descriptionTranslations" text, "details" character varying, "information" character varying, "doneAt" TIMESTAMP WITH TIME ZONE, "expectedDeliveryDate" TIMESTAMP WITH TIME ZONE, "imageUrl" character varying, "needRetailerImg" character varying, "midjourneyImage" character varying, "isConfirmed" boolean, "isDeleted" boolean, "isUrgent" boolean, "link" character varying, "nameTranslations" text, "ngoDeliveryDate" TIMESTAMP WITH TIME ZONE, "purchaseCost" integer, "purchaseDate" TIMESTAMP WITH TIME ZONE, "deliveryCode" character varying, "status" integer, "type" "public"."need_entity_type_enum", "updated" TIMESTAMP WITH TIME ZONE, "unavailableFrom" TIMESTAMP WITH TIME ZONE, "flaskChildId" integer NOT NULL, "flaskNgoId" integer, "isResolved" boolean NOT NULL DEFAULT true, "isMined" boolean NOT NULL DEFAULT false, "childId" uuid, "providerId" uuid, "ngoId" uuid, "socialWorkerId" uuid, "auditorId" uuid, "purchaserId" uuid, CONSTRAINT "PK_6b2263a6cb229f5adf3b7698e7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c73cc49efc1361547fc749e497" ON "need_entity" ("flaskId") `);
        await queryRunner.query(`CREATE TABLE "children_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskId" integer NOT NULL, "flaskConfirmUser" integer, "awakeAvatarUrl" character varying, "adultAvatarUrl" character varying, "bioSummaryTranslations" hstore NOT NULL, "bioTranslations" hstore NOT NULL, "birthDate" TIMESTAMP WITH TIME ZONE, "birthPlace" character varying, "city" integer, "confirmDate" TIMESTAMP WITH TIME ZONE, "country" integer, "created" TIMESTAMP WITH TIME ZONE, "education" integer, "existenceStatus" integer, "generatedCode" character varying, "housingStatus" integer, "flaskSwId" integer, "isConfirmed" boolean, "isDeleted" boolean, "isMigrated" boolean, "migrateDate" TIMESTAMP WITH TIME ZONE, "migratedId" integer, "nationality" integer, "sayFamilyCount" integer, "sayName" character varying, "sayNameTranslations" hstore NOT NULL, "sleptAvatarUrl" character varying, "flaskNgoId" integer, "updated" TIMESTAMP WITH TIME ZONE, "voiceUrl" character varying, "ngoId" uuid NOT NULL, "socialWorkerId" uuid, CONSTRAINT "PK_03576748d9cd87048e59345b289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "step_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "dueDate" TIMESTAMP WITH TIME ZONE, "title" character varying, "description" character varying, "needId" uuid, "mileStoneId" uuid, CONSTRAINT "REL_44a47e151e5d6477d3bc425a35" UNIQUE ("needId"), CONSTRAINT "PK_4a808481c2e94570d09de3fea2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mile_stone_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "signature" character varying, "childId" uuid, CONSTRAINT "REL_3a8449f5e27cffc82bbe3a9e16" UNIQUE ("childId"), CONSTRAINT "PK_b20c84c8080e0256d573596a2f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "provider_join_need_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskNeedId" integer NOT NULL, "nestProviderId" character varying NOT NULL, CONSTRAINT "PK_11ed74be7ff20482a1e02cc5230" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_856f535369820035ba8b7ea6b1" ON "provider_join_need_entity" ("flaskNeedId") `);
        await queryRunner.query(`CREATE TABLE "midjourney_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "flaskNeedId" integer NOT NULL, "fileName" character varying NOT NULL, "needId" uuid, CONSTRAINT "REL_cd02e67d7cda1e079bb93cd183" UNIQUE ("needId"), CONSTRAINT "PK_8ce91c781773714e07119297210" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c2e643f9d92cac1350c7b61734" ON "midjourney_entity" ("flaskNeedId") `);
        await queryRunner.query(`CREATE TABLE "session" ("sid" character varying NOT NULL, "expire" TIMESTAMP NOT NULL, "sess" character varying NOT NULL, "destroyedAt" TIMESTAMP, CONSTRAINT "UQ_98cd22e19ffa6e56f97b8a20000" UNIQUE ("sess"), CONSTRAINT "PK_7575923e18b495ed2307ae629ae" PRIMARY KEY ("sid"))`);
        await queryRunner.query(`CREATE TABLE "ticket_entity_contributors_all_user_entity" ("ticketEntityId" uuid NOT NULL, "allUserEntityId" uuid NOT NULL, CONSTRAINT "PK_7ac47813256132518ad810bed49" PRIMARY KEY ("ticketEntityId", "allUserEntityId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_876556e7a2c40f48b2ade3a6b2" ON "ticket_entity_contributors_all_user_entity" ("ticketEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0ec8041b4922af9b98159b9de" ON "ticket_entity_contributors_all_user_entity" ("allUserEntityId") `);
        await queryRunner.query(`ALTER TABLE "ethereum_transaction" ADD CONSTRAINT "FK_c0e075b339caf8d0807d3b0a003" FOREIGN KEY ("ethereumAccountId") REFERENCES "ethereum_account_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ethereum_transaction" ADD CONSTRAINT "FK_6b1f70cd19231334231a6e428c0" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ethereum_account_entity" ADD CONSTRAINT "FK_0561cfb122ea3b0becef0ab0c3b" FOREIGN KEY ("userId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_content_entity" ADD CONSTRAINT "FK_e63ee920b0d2a63643f47e9c931" FOREIGN KEY ("ticketId") REFERENCES "ticket_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_view_entity" ADD CONSTRAINT "FK_36ce21d26eda8a5944dc8fabe8e" FOREIGN KEY ("ticketId") REFERENCES "ticket_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_entity" ADD CONSTRAINT "FK_9ed4f8c30fc0e8bf6e393c8a3ba" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD CONSTRAINT "FK_2b2ec4ae41b2b9a3c6a48054d45" FOREIGN KEY ("locationId") REFERENCES "location_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ngo_entity" ADD CONSTRAINT "FK_6ec8a85276e7c6122fbd237210a" FOREIGN KEY ("locationId") REFERENCES "location_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ngo_arrival_entity" ADD CONSTRAINT "FK_c66bc972ee4550f1e1547f118b6" FOREIGN KEY ("ngoId") REFERENCES "ngo_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributor_entity" ADD CONSTRAINT "FK_268121125c058c02930d68fd12d" FOREIGN KEY ("ngoId") REFERENCES "ngo_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributor_entity" ADD CONSTRAINT "FK_3957cbc1b9921742b68573dbc6f" FOREIGN KEY ("userId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "signature_entity" ADD CONSTRAINT "FK_8db4c0202de4b282eb28846cdc5" FOREIGN KEY ("userId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "signature_entity" ADD CONSTRAINT "FK_d44b5e506ad82903d637d5c724c" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_entity" ADD CONSTRAINT "FK_4e95d2c5173479ecb2ab47a9a04" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_entity" ADD CONSTRAINT "FK_e391949c5735c084dddcb6e6468" FOREIGN KEY ("userId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_entity" ADD CONSTRAINT "FK_8d7273a6cc0fb1d9bf0d9bec71e" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_entity" ADD CONSTRAINT "FK_e15e65d86f15db08de8339f04d6" FOREIGN KEY ("familyMemberId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "receipt_entity" ADD CONSTRAINT "FK_1b6a101de682d2c6e98f96471fd" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "status_entity" ADD CONSTRAINT "FK_78adab30edc58f9b086c78c4965" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ipfs_entity" ADD CONSTRAINT "FK_0c54e50c9105e9f7e0e528fcd02" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD CONSTRAINT "FK_9f8938f6f44467862a0175234b0" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "need_entity" ADD CONSTRAINT "FK_1e0bf77ca2113852ab80f5917fe" FOREIGN KEY ("childId") REFERENCES "children_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "need_entity" ADD CONSTRAINT "FK_1a32ca84a66bf84237a483e11b3" FOREIGN KEY ("providerId") REFERENCES "provider_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "need_entity" ADD CONSTRAINT "FK_202d60ab6da604c3680aa11614f" FOREIGN KEY ("ngoId") REFERENCES "ngo_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "need_entity" ADD CONSTRAINT "FK_5676702c82d297c17632e880182" FOREIGN KEY ("socialWorkerId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "need_entity" ADD CONSTRAINT "FK_46ab541c911444eee8c3ff7a1f3" FOREIGN KEY ("auditorId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "need_entity" ADD CONSTRAINT "FK_cdeab2b9135b755ff9f96a05ce7" FOREIGN KEY ("purchaserId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "children_entity" ADD CONSTRAINT "FK_e4855c91e54a9c176897479ef14" FOREIGN KEY ("ngoId") REFERENCES "ngo_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "children_entity" ADD CONSTRAINT "FK_35f77fd2dbc164ef5c3990356e2" FOREIGN KEY ("socialWorkerId") REFERENCES "contributor_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "step_entity" ADD CONSTRAINT "FK_44a47e151e5d6477d3bc425a35d" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "step_entity" ADD CONSTRAINT "FK_d6e69320247224924c7a7e86cf5" FOREIGN KEY ("mileStoneId") REFERENCES "mile_stone_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mile_stone_entity" ADD CONSTRAINT "FK_3a8449f5e27cffc82bbe3a9e161" FOREIGN KEY ("childId") REFERENCES "children_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "midjourney_entity" ADD CONSTRAINT "FK_cd02e67d7cda1e079bb93cd183a" FOREIGN KEY ("needId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_entity_contributors_all_user_entity" ADD CONSTRAINT "FK_876556e7a2c40f48b2ade3a6b24" FOREIGN KEY ("ticketEntityId") REFERENCES "ticket_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "ticket_entity_contributors_all_user_entity" ADD CONSTRAINT "FK_f0ec8041b4922af9b98159b9ded" FOREIGN KEY ("allUserEntityId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket_entity_contributors_all_user_entity" DROP CONSTRAINT "FK_f0ec8041b4922af9b98159b9ded"`);
        await queryRunner.query(`ALTER TABLE "ticket_entity_contributors_all_user_entity" DROP CONSTRAINT "FK_876556e7a2c40f48b2ade3a6b24"`);
        await queryRunner.query(`ALTER TABLE "midjourney_entity" DROP CONSTRAINT "FK_cd02e67d7cda1e079bb93cd183a"`);
        await queryRunner.query(`ALTER TABLE "mile_stone_entity" DROP CONSTRAINT "FK_3a8449f5e27cffc82bbe3a9e161"`);
        await queryRunner.query(`ALTER TABLE "step_entity" DROP CONSTRAINT "FK_d6e69320247224924c7a7e86cf5"`);
        await queryRunner.query(`ALTER TABLE "step_entity" DROP CONSTRAINT "FK_44a47e151e5d6477d3bc425a35d"`);
        await queryRunner.query(`ALTER TABLE "children_entity" DROP CONSTRAINT "FK_35f77fd2dbc164ef5c3990356e2"`);
        await queryRunner.query(`ALTER TABLE "children_entity" DROP CONSTRAINT "FK_e4855c91e54a9c176897479ef14"`);
        await queryRunner.query(`ALTER TABLE "need_entity" DROP CONSTRAINT "FK_cdeab2b9135b755ff9f96a05ce7"`);
        await queryRunner.query(`ALTER TABLE "need_entity" DROP CONSTRAINT "FK_46ab541c911444eee8c3ff7a1f3"`);
        await queryRunner.query(`ALTER TABLE "need_entity" DROP CONSTRAINT "FK_5676702c82d297c17632e880182"`);
        await queryRunner.query(`ALTER TABLE "need_entity" DROP CONSTRAINT "FK_202d60ab6da604c3680aa11614f"`);
        await queryRunner.query(`ALTER TABLE "need_entity" DROP CONSTRAINT "FK_1a32ca84a66bf84237a483e11b3"`);
        await queryRunner.query(`ALTER TABLE "need_entity" DROP CONSTRAINT "FK_1e0bf77ca2113852ab80f5917fe"`);
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP CONSTRAINT "FK_9f8938f6f44467862a0175234b0"`);
        await queryRunner.query(`ALTER TABLE "ipfs_entity" DROP CONSTRAINT "FK_0c54e50c9105e9f7e0e528fcd02"`);
        await queryRunner.query(`ALTER TABLE "status_entity" DROP CONSTRAINT "FK_78adab30edc58f9b086c78c4965"`);
        await queryRunner.query(`ALTER TABLE "receipt_entity" DROP CONSTRAINT "FK_1b6a101de682d2c6e98f96471fd"`);
        await queryRunner.query(`ALTER TABLE "payment_entity" DROP CONSTRAINT "FK_e15e65d86f15db08de8339f04d6"`);
        await queryRunner.query(`ALTER TABLE "payment_entity" DROP CONSTRAINT "FK_8d7273a6cc0fb1d9bf0d9bec71e"`);
        await queryRunner.query(`ALTER TABLE "comment_entity" DROP CONSTRAINT "FK_e391949c5735c084dddcb6e6468"`);
        await queryRunner.query(`ALTER TABLE "comment_entity" DROP CONSTRAINT "FK_4e95d2c5173479ecb2ab47a9a04"`);
        await queryRunner.query(`ALTER TABLE "signature_entity" DROP CONSTRAINT "FK_d44b5e506ad82903d637d5c724c"`);
        await queryRunner.query(`ALTER TABLE "signature_entity" DROP CONSTRAINT "FK_8db4c0202de4b282eb28846cdc5"`);
        await queryRunner.query(`ALTER TABLE "contributor_entity" DROP CONSTRAINT "FK_3957cbc1b9921742b68573dbc6f"`);
        await queryRunner.query(`ALTER TABLE "contributor_entity" DROP CONSTRAINT "FK_268121125c058c02930d68fd12d"`);
        await queryRunner.query(`ALTER TABLE "ngo_arrival_entity" DROP CONSTRAINT "FK_c66bc972ee4550f1e1547f118b6"`);
        await queryRunner.query(`ALTER TABLE "ngo_entity" DROP CONSTRAINT "FK_6ec8a85276e7c6122fbd237210a"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP CONSTRAINT "FK_2b2ec4ae41b2b9a3c6a48054d45"`);
        await queryRunner.query(`ALTER TABLE "ticket_entity" DROP CONSTRAINT "FK_9ed4f8c30fc0e8bf6e393c8a3ba"`);
        await queryRunner.query(`ALTER TABLE "ticket_view_entity" DROP CONSTRAINT "FK_36ce21d26eda8a5944dc8fabe8e"`);
        await queryRunner.query(`ALTER TABLE "ticket_content_entity" DROP CONSTRAINT "FK_e63ee920b0d2a63643f47e9c931"`);
        await queryRunner.query(`ALTER TABLE "ethereum_account_entity" DROP CONSTRAINT "FK_0561cfb122ea3b0becef0ab0c3b"`);
        await queryRunner.query(`ALTER TABLE "ethereum_transaction" DROP CONSTRAINT "FK_6b1f70cd19231334231a6e428c0"`);
        await queryRunner.query(`ALTER TABLE "ethereum_transaction" DROP CONSTRAINT "FK_c0e075b339caf8d0807d3b0a003"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0ec8041b4922af9b98159b9de"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_876556e7a2c40f48b2ade3a6b2"`);
        await queryRunner.query(`DROP TABLE "ticket_entity_contributors_all_user_entity"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2e643f9d92cac1350c7b61734"`);
        await queryRunner.query(`DROP TABLE "midjourney_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_856f535369820035ba8b7ea6b1"`);
        await queryRunner.query(`DROP TABLE "provider_join_need_entity"`);
        await queryRunner.query(`DROP TABLE "mile_stone_entity"`);
        await queryRunner.query(`DROP TABLE "step_entity"`);
        await queryRunner.query(`DROP TABLE "children_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c73cc49efc1361547fc749e497"`);
        await queryRunner.query(`DROP TABLE "need_entity"`);
        await queryRunner.query(`DROP TYPE "public"."need_entity_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."need_entity_category_enum"`);
        await queryRunner.query(`DROP TABLE "variable_entity"`);
        await queryRunner.query(`DROP TABLE "ipfs_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_81d9eb1ba2e8039c6f4cc29abe"`);
        await queryRunner.query(`DROP TABLE "status_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_908a989fd5680fc920da668472"`);
        await queryRunner.query(`DROP TABLE "receipt_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2dbfe67b6b48602609e1619f72"`);
        await queryRunner.query(`DROP TABLE "payment_entity"`);
        await queryRunner.query(`DROP TABLE "all_user_entity"`);
        await queryRunner.query(`DROP TABLE "comment_entity"`);
        await queryRunner.query(`DROP TABLE "signature_entity"`);
        await queryRunner.query(`DROP TYPE "public"."signature_entity_role_enum"`);
        await queryRunner.query(`DROP TABLE "contributor_entity"`);
        await queryRunner.query(`DROP TYPE "public"."contributor_entity_panelrole_enum"`);
        await queryRunner.query(`DROP TABLE "ngo_arrival_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_03fd2e6f1edd77c3e649d3c12b"`);
        await queryRunner.query(`DROP TABLE "ngo_entity"`);
        await queryRunner.query(`DROP TABLE "location_entity"`);
        await queryRunner.query(`DROP TABLE "children_pre_register_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bee0cca5348046f06053b7a6e5"`);
        await queryRunner.query(`DROP TABLE "ticket_entity"`);
        await queryRunner.query(`DROP TABLE "ticket_view_entity"`);
        await queryRunner.query(`DROP TABLE "ticket_content_entity"`);
        await queryRunner.query(`DROP TABLE "ethereum_account_entity"`);
        await queryRunner.query(`DROP TABLE "ethereum_transaction"`);
        await queryRunner.query(`DROP TABLE "provider_entity"`);
    }

}
