-- Table: public.GameHistory_20250325

-- DROP TABLE IF EXISTS public."GameHistory_20250325";

CREATE SEQUENCE "GameHistory_20250325_id_seq"  
START WITH 1  
INCREMENT BY 1 
NO MINVALUE  
NO MAXVALUE  
CACHE 1;

CREATE TABLE IF NOT EXISTS public."GameHistory_20250325"
(
    id bigint NOT NULL DEFAULT nextval('"GameHistory_20250325_id_seq"'::regclass),
    "historyId" bigint NOT NULL,
    currency text COLLATE pg_catalog."default" NOT NULL,
    fscc integer NOT NULL DEFAULT 0,
    mgcc integer NOT NULL DEFAULT 0,
    ge jsonb NOT NULL,
    "gameID" integer NOT NULL,
    "totalBet" numeric(65,30) NOT NULL,
    "operatorId" integer NOT NULL,
    "playerId" integer NOT NULL,
    profit numeric(65,30) NOT NULL DEFAULT 0,
    "moneyPoolId" integer,
    "moneyPool" jsonb,
    detail jsonb,
    "isTesting" boolean NOT NULL DEFAULT false,
    "operatorUsername" text COLLATE pg_catalog."default",
    "operatorAccountID" text COLLATE pg_catalog."default",
    "balanceBefore" numeric(65,30),
    "balanceAfter" numeric(65,30),
    version integer DEFAULT 0,
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status "GameHistoryStatus" NOT NULL DEFAULT 'Ready'::"GameHistoryStatus",
    CONSTRAINT "GameHistory_20250325_pkey" PRIMARY KEY (id)
) PARTITION BY RANGE (id);

ALTER TABLE IF EXISTS public."GameHistory_20250325"
    OWNER to postgres;
-- Index: GameHistory_20250325_createdAt_idx

-- DROP INDEX IF EXISTS public."GameHistory_20250325_createdAt_idx";

CREATE INDEX IF NOT EXISTS "GameHistory_20250325_createdAt_idx"
    ON public."GameHistory_20250325" USING btree
    ("createdAt" ASC NULLS LAST)
;
-- Index: GameHistory_20250325_gameID_idx

-- DROP INDEX IF EXISTS public."GameHistory_20250325_gameID_idx";

CREATE INDEX IF NOT EXISTS "GameHistory_20250325_gameID_idx"
    ON public."GameHistory_20250325" USING btree
    ("gameID" ASC NULLS LAST)
;
-- Index: GameHistory_20250325_historyId_idx

-- DROP INDEX IF EXISTS public."GameHistory_20250325_historyId_idx";

CREATE INDEX IF NOT EXISTS "GameHistory_20250325_historyId_idx"
    ON public."GameHistory_20250325" USING btree
    ("historyId" ASC NULLS LAST)
;
-- Index: GameHistory_20250325_operatorAccountID_idx

-- DROP INDEX IF EXISTS public."GameHistory_20250325_operatorAccountID_idx";

CREATE INDEX IF NOT EXISTS "GameHistory_20250325_operatorAccountID_idx"
    ON public."GameHistory_20250325" USING btree
    ("operatorAccountID" COLLATE pg_catalog."default" ASC NULLS LAST)
;
-- Index: GameHistory_20250325_operatorId_idx

-- DROP INDEX IF EXISTS public."GameHistory_20250325_operatorId_idx";

CREATE INDEX IF NOT EXISTS "GameHistory_20250325_operatorId_idx"
    ON public."GameHistory_20250325" USING btree
    ("operatorId" ASC NULLS LAST)
;
-- Index: GameHistory_20250325_playerId_idx

-- DROP INDEX IF EXISTS public."GameHistory_20250325_playerId_idx";

CREATE INDEX IF NOT EXISTS "GameHistory_20250325_playerId_idx"
    ON public."GameHistory_20250325" USING btree
    ("playerId" ASC NULLS LAST)
;
-- Index: GameHistory_20250325_status_idx

-- DROP INDEX IF EXISTS public."GameHistory_20250325_status_idx";

CREATE INDEX IF NOT EXISTS "GameHistory_20250325_status_idx"
    ON public."GameHistory_20250325" USING btree
    (status ASC NULLS LAST)
;
-- Index: GameHistory_20250325_updatedAt_idx

-- DROP INDEX IF EXISTS public."GameHistory_20250325_updatedAt_idx";

CREATE INDEX IF NOT EXISTS "GameHistory_20250325_updatedAt_idx"
    ON public."GameHistory_20250325" USING btree
    ("updatedAt" ASC NULLS LAST)
;

-- Partitions SQL

CREATE TABLE public."GameHistory_20250325_default" PARTITION OF public."GameHistory_20250325"
    DEFAULT
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_default"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p0" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('0') TO ('2500000')
TABLESPACE pg_default;
ALTER TABLE IF EXISTS public."GameHistory_20250325_p0"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p10000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('10000000') TO ('12500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p10000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p100000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('100000000') TO ('102500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p100000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p12500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('12500000') TO ('15000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p12500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p15000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('15000000') TO ('17500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p15000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p17500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('17500000') TO ('20000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p17500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p20000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('20000000') TO ('22500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p20000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p22500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('22500000') TO ('25000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p22500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p2500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('2500000') TO ('5000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p2500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p25000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('25000000') TO ('27500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p25000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p27500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('27500000') TO ('30000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p27500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p30000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('30000000') TO ('32500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p30000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p32500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('32500000') TO ('35000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p32500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p35000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('35000000') TO ('37500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p35000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p37500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('37500000') TO ('40000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p37500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p40000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('40000000') TO ('42500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p40000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p42500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('42500000') TO ('45000000')
TABLESPACE pg_default;
ALTER TABLE IF EXISTS public."GameHistory_20250325_p42500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p45000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('45000000') TO ('47500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p45000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p47500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('47500000') TO ('50000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p47500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p5000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('5000000') TO ('7500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p5000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p50000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('50000000') TO ('52500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p50000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p52500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('52500000') TO ('55000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p52500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p55000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('55000000') TO ('57500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p55000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p57500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('57500000') TO ('60000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p57500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p60000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('60000000') TO ('62500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p60000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p62500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('62500000') TO ('65000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p62500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p65000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('65000000') TO ('67500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p65000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p67500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('67500000') TO ('70000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p67500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p70000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('70000000') TO ('72500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p70000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p72500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('72500000') TO ('75000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p72500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p7500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('7500000') TO ('10000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p7500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p75000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('75000000') TO ('77500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p75000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p77500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('77500000') TO ('80000000')
TABLESPACE pg_default;
ALTER TABLE IF EXISTS public."GameHistory_20250325_p77500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p80000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('80000000') TO ('82500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p80000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p82500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('82500000') TO ('85000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p82500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p85000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('85000000') TO ('87500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p85000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p87500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('87500000') TO ('90000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p87500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p90000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('90000000') TO ('92500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p90000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p92500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('92500000') TO ('95000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p92500000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p95000000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('95000000') TO ('97500000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p95000000"
    OWNER to postgres;
CREATE TABLE public."GameHistory_20250325_p97500000" PARTITION OF public."GameHistory_20250325"
    FOR VALUES FROM ('97500000') TO ('100000000')
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."GameHistory_20250325_p97500000"
    OWNER to postgres;