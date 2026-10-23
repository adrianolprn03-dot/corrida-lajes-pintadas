-- ==============================================================================
-- 5ª CORRIDA DE EMANCIPAÇÃO POLÍTICA DE LAJES PINTADAS/RN
-- DATABASE SCHEMA & STORED PROCEDURES (POSTGRESQL / SUPABASE)
-- Data do Evento: 26 de dezembro de 2026 | Percurso: 5 km
-- ==============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
DO $$ BEGIN
    CREATE TYPE event_status_enum AS ENUM ('PREPARATION', 'OPEN', 'SUSPENDED', 'CLOSED', 'SOLD_OUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE athlete_gender_enum AS ENUM ('MASCULINO', 'FEMININO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE category_enum AS ENUM ('CASA_MASCULINO', 'CASA_FEMININO', 'VISITANTE_MASCULINO', 'VISITANTE_FEMININO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE origin_type_enum AS ENUM ('CASA', 'VISITANTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE casa_proof_enum AS ENUM ('NATURAL', 'RESIDENTE', 'NATURAL_E_RESIDENTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status_enum AS ENUM ('RESERVED', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'IN_REVIEW', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('PIX', 'CREDIT_CARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE financial_status_enum AS ENUM ('PENDING', 'CONFIRMED', 'RECEIVED', 'IN_ANALYSIS', 'REFUNDED', 'DISPUTED', 'OVERDUE', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. TABELA DE CONFIGURAÇÕES DO EVENTO (SINGLE ROW)
CREATE TABLE IF NOT EXISTS event_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_singleton BOOLEAN UNIQUE DEFAULT TRUE,
    event_name TEXT NOT NULL DEFAULT '5ª Corrida de Emancipação Política de Lajes Pintadas/RN',
    edition TEXT NOT NULL DEFAULT '5ª Edição',
    event_date DATE NOT NULL DEFAULT '2026-12-26',
    distance_km NUMERIC(4,1) NOT NULL DEFAULT 5.0,
    base_price_cents INTEGER NOT NULL DEFAULT 6000, -- R$ 60,00
    status event_status_enum NOT NULL DEFAULT 'PREPARATION',
    
    -- Itens configuráveis pelo Administrador
    max_capacity INTEGER DEFAULT NULL,
    local_max_capacity INTEGER DEFAULT NULL, -- Cota de vagas categoria Local (Lajespintadense)
    visitor_max_capacity INTEGER DEFAULT NULL, -- Cota de vagas categoria Visitante
    min_age INTEGER DEFAULT NULL,
    minor_rules TEXT DEFAULT 'Participantes menores de 18 anos devem apresentar autorização formal por escrito assinada por pai, mãe ou responsável legal com cópia de documento de identidade na retirada do kit.',
    start_time TEXT DEFAULT '06:00',
    start_location TEXT DEFAULT 'Praça Monsenhor Freitas (Centro), Lajes Pintadas/RN',
    registration_start_date TIMESTAMPTZ DEFAULT NULL,
    registration_end_date TIMESTAMPTZ DEFAULT NULL,
    kit_pickup_info TEXT DEFAULT 'A retirada dos kits ocorrerá no Centro de Convivência dos Idosos, mediante apresentação de documento oficial com foto e comprovante de inscrição. Categoria Casa deverá apresentar comprovação de vínculo conforme regulamento.',
    cancellation_policy TEXT DEFAULT 'Conforme Art. 49 do Código de Defesa do Consumidor, o cancelamento com reembolso integral pode ser solicitado em até 7 dias corridos após o pagamento da inscrição.',
    organizer_name TEXT DEFAULT 'Comissão Organizadora da 5ª Corrida de Emancipação / Secretaria Municipal de Esportes',
    organizer_contact TEXT DEFAULT 'esportes@lajespintadas.rn.gov.br | (84) 98800-0000',
    revenue_responsible TEXT DEFAULT 'Tesouraria Municipal / Fundo Municipal de Esportes',
    
    -- Tarifas e Gateway Asaas
    asaas_environment TEXT NOT NULL DEFAULT 'sandbox',
    asaas_pix_fixed_fee_cents INTEGER NOT NULL DEFAULT 99, -- R$ 0,99
    asaas_credit_fixed_fee_cents INTEGER NOT NULL DEFAULT 49, -- R$ 0,49
    asaas_credit_percent_fee NUMERIC(6,4) NOT NULL DEFAULT 0.0299, -- 2,99%
    
    -- Regulamento e Privacidade
    terms_version TEXT NOT NULL DEFAULT 'v1.0',
    privacy_version TEXT NOT NULL DEFAULT 'v1.0',
    terms_content TEXT NOT NULL DEFAULT 'O regulamento oficial da 5ª Corrida de Emancipação Política de Lajes Pintadas/RN será homologado e disponibilizado para download integral antes do início das inscrições.',
    privacy_content TEXT NOT NULL DEFAULT 'Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), os dados cadastrais serão utilizados unicamente para fins operacionais, cronometragem e segurança médica da corrida.',
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir que existe apenas 1 linha de configuração
INSERT INTO event_settings (is_singleton)
VALUES (TRUE)
ON CONFLICT (is_singleton) DO NOTHING;

-- 2. TABELA DE GRADE E ESTOQUE DE CAMISAS
CREATE TABLE IF NOT EXISTS shirt_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    size TEXT NOT NULL UNIQUE, -- PP, P, M, G, GG, XG
    display_order INTEGER NOT NULL DEFAULT 0,
    total_stock INTEGER NOT NULL DEFAULT 0,
    reserved_count INTEGER NOT NULL DEFAULT 0,
    confirmed_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir tamanhos padrão (estoque inicial 0, configurável pelo admin)
INSERT INTO shirt_inventory (size, display_order, total_stock)
VALUES 
    ('PP', 1, 0),
    ('P',  2, 0),
    ('M',  3, 0),
    ('G',  4, 0),
    ('GG', 5, 0),
    ('XG', 6, 0)
ON CONFLICT (size) DO NOTHING;

-- 3. TABELA DE USUÁRIOS ADMINISTRATIVOS
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN', -- 'ADMIN', 'OPERATOR', 'AUDITOR'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DE ATLETAS (CADASTRO ÚNICO POR CPF)
CREATE TABLE IF NOT EXISTS athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    email TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city TEXT NOT NULL,
    state VARCHAR(2) NOT NULL,
    team TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athletes_cpf ON athletes(cpf);
CREATE INDEX IF NOT EXISTS idx_athletes_email ON athletes(email);

-- 5. TABELA DE INSCRIÇÕES
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE RESTRICT,
    protocol VARCHAR(30) NOT NULL UNIQUE,
    access_code_hash VARCHAR(64) NOT NULL, -- SHA-256
    
    -- Categoria calculada no servidor
    category category_enum NOT NULL,
    origin_type origin_type_enum NOT NULL,
    gender athlete_gender_enum NOT NULL,
    casa_proof_type casa_proof_enum DEFAULT NULL,
    shirt_size TEXT NOT NULL REFERENCES shirt_inventory(size),
    
    -- Estado da inscrição e financeiro separados
    status registration_status_enum NOT NULL DEFAULT 'RESERVED',
    financial_status financial_status_enum NOT NULL DEFAULT 'PENDING',
    payment_method payment_method_enum NOT NULL,
    
    -- Valores calculados no servidor (em centavos inteiros)
    base_amount_cents INTEGER NOT NULL DEFAULT 6000, -- R$ 60,00
    processing_fee_cents INTEGER NOT NULL,
    total_amount_cents INTEGER NOT NULL,
    net_received_cents INTEGER DEFAULT NULL,
    fee_discrepancy_cents INTEGER DEFAULT NULL,
    
    -- Integração Asaas
    asaas_payment_id TEXT UNIQUE DEFAULT NULL,
    asaas_customer_id TEXT DEFAULT NULL,
    asaas_invoice_url TEXT DEFAULT NULL,
    asaas_pix_qr_code TEXT DEFAULT NULL,
    asaas_pix_copy_paste TEXT DEFAULT NULL,
    
    -- Tempos e expiração
    reservation_expires_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ DEFAULT NULL,
    
    -- Aceite legal
    terms_version TEXT NOT NULL,
    terms_accepted_at TIMESTAMPTZ NOT NULL,
    privacy_version TEXT NOT NULL,
    privacy_accepted_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    
    -- Retirada do Kit
    kit_delivered BOOLEAN NOT NULL DEFAULT FALSE,
    kit_delivered_at TIMESTAMPTZ DEFAULT NULL,
    kit_delivered_by TEXT DEFAULT NULL,
    kit_notes TEXT DEFAULT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_protocol ON registrations(protocol);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_category ON registrations(category);
CREATE INDEX IF NOT EXISTS idx_registrations_asaas_id ON registrations(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_registrations_athlete ON registrations(athlete_id);

-- 6. TABELA DE LOGS DE WEBHOOK ASAAS
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT DEFAULT NULL,
    event_type TEXT NOT NULL,
    payment_id TEXT DEFAULT NULL,
    signature_valid BOOLEAN NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT DEFAULT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_payment ON webhook_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON webhook_logs(event_type);

-- 7. TABELA DE AUDITORIA ADMINISTRATIVA
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id TEXT NOT NULL,
    actor_email TEXT DEFAULT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT DEFAULT NULL,
    details JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shirt_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- event_settings: Leitura pública das regras e dados do evento; gravação só admin
CREATE POLICY "Public read event settings" ON event_settings
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Admin update event settings" ON event_settings
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));

-- shirt_inventory: Leitura pública dos tamanhos e disponibilidade geral; gravação só admin
CREATE POLICY "Public read shirt inventory" ON shirt_inventory
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Admin manage shirt inventory" ON shirt_inventory
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));

-- admin_users: Somente o próprio admin ou super admin
CREATE POLICY "Admin read admin users" ON admin_users
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));

-- athletes: Proibida listagem pública.
-- Usuário anônimo NÃO tem SELECT direto na tabela de atletas.
CREATE POLICY "Admin read all athletes" ON athletes
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));

-- registrations: Proibida listagem pública.
CREATE POLICY "Admin manage all registrations" ON registrations
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));

-- webhook_logs: Somente admin e funções de serviço
CREATE POLICY "Admin read webhook logs" ON webhook_logs
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));

-- audit_logs: Somente admin
CREATE POLICY "Admin read audit logs" ON audit_logs
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));


-- ==============================================================================
-- FUNÇÕES ARITMÉTICAS E CÁLCULO DE PREÇO (PURAMENTE NO SERVIDOR)
-- ==============================================================================
CREATE OR REPLACE FUNCTION calculate_registration_pricing(
    p_payment_method payment_method_enum
) RETURNS TABLE (
    base_cents INTEGER,
    fee_cents INTEGER,
    total_cents INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
    v_base_price INTEGER;
    v_pix_fee INTEGER;
    v_card_fee INTEGER;
    v_card_percent NUMERIC(6,4);
    v_total_cents INTEGER;
    v_fee_cents INTEGER;
BEGIN
    SELECT base_price_cents, asaas_pix_fixed_fee_cents, asaas_credit_fixed_fee_cents, asaas_credit_percent_fee
    INTO v_base_price, v_pix_fee, v_card_fee, v_card_percent
    FROM event_settings
    LIMIT 1;

    IF v_base_price IS NULL THEN
        v_base_price := 6000;
        v_pix_fee := 99;
        v_card_fee := 49;
        v_card_percent := 0.0299;
    END IF;

    IF p_payment_method = 'PIX' THEN
        -- Pix com tarifa fixa: total = 60,00 + tarifa
        v_total_cents := v_base_price + v_pix_fee;
        v_fee_cents := v_pix_fee;
    ELSE
        -- Cartão de crédito: total = (60,00 + tarifa fixa) ÷ (1 − percentual)
        -- Cálculo em centavos com arredondamento explícito para cima (CEIL) para preservar exatamente os R$ 60,00 líquidos
        v_total_cents := CEIL((v_base_price + v_card_fee) / (1.0 - v_card_percent));
        v_fee_cents := v_total_cents - v_base_price;
    END IF;

    RETURN QUERY SELECT v_base_price, v_fee_cents, v_total_cents;
END;
$$;


-- ==============================================================================
-- PROCEDURE ATÔMICA: RESERVA TRANSACIONAL COM SELECT FOR UPDATE
-- ==============================================================================
CREATE OR REPLACE FUNCTION create_registration_reservation(
    p_full_name TEXT,
    p_cpf VARCHAR(11),
    p_birth_date DATE,
    p_email TEXT,
    p_phone VARCHAR(20),
    p_city TEXT,
    p_state VARCHAR(2),
    p_team TEXT,
    p_origin_type origin_type_enum,
    p_gender athlete_gender_enum,
    p_casa_proof_type casa_proof_enum,
    p_shirt_size TEXT,
    p_payment_method payment_method_enum,
    p_terms_version TEXT,
    p_privacy_version TEXT,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_settings event_settings%ROWTYPE;
    v_shirt shirt_inventory%ROWTYPE;
    v_existing_active_reg registrations%ROWTYPE;
    v_athlete_id UUID;
    v_reg_id UUID;
    v_protocol TEXT;
    v_raw_access_code TEXT;
    v_access_code_hash TEXT;
    v_category category_enum;
    v_pricing RECORD;
    v_available_shirts INTEGER;
    v_total_active_regs INTEGER;
    v_category_active_regs INTEGER;
    v_clean_cpf VARCHAR(11);
    v_athlete_age INTEGER;
BEGIN
    -- 1. Normalizar CPF (apenas números)
    v_clean_cpf := regexp_replace(p_cpf, '\D', '', 'g');
    IF length(v_clean_cpf) <> 11 THEN
        RAISE EXCEPTION 'CPF deve conter exatamente 11 dígitos.';
    END IF;

    -- 2. Bloquear e obter configurações do evento
    SELECT * INTO v_settings FROM event_settings LIMIT 1 FOR UPDATE;
    
    IF v_settings.status <> 'OPEN' THEN
        IF v_settings.status = 'PREPARATION' THEN
            RAISE EXCEPTION 'As inscrições ainda não foram abertas. O evento está em fase de preparação.';
        ELSIF v_settings.status = 'SUSPENDED' THEN
            RAISE EXCEPTION 'As inscrições estão temporariamente suspensas pela organização.';
        ELSIF v_settings.status = 'CLOSED' THEN
            RAISE EXCEPTION 'As inscrições para a 5ª Corrida de Emancipação estão encerradas.';
        ELSIF v_settings.status = 'SOLD_OUT' THEN
            RAISE EXCEPTION 'Vagas esgotadas para a 5ª Corrida de Emancipação.';
        ELSE
            RAISE EXCEPTION 'Inscrições indisponíveis no momento.';
        END IF;
    END IF;

    -- 3. Validação de Idade Mínima
    v_athlete_age := EXTRACT(YEAR FROM age(v_settings.event_date, p_birth_date));
    IF v_settings.min_age IS NOT NULL AND v_athlete_age < v_settings.min_age THEN
        RAISE EXCEPTION 'A idade mínima permitida para o evento é de % anos. Atleta tem % anos na data do evento.', v_settings.min_age, v_athlete_age;
    END IF;

    -- 4. Validação de Regras Casa / Visitante e Consistência de Residência
    IF p_origin_type = 'CASA' THEN
        IF p_casa_proof_type IS NULL THEN
            RAISE EXCEPTION 'Para categoria Casa, é obrigatório declarar o tipo de vínculo com Lajes Pintadas/RN.';
        END IF;
        
        -- Se declarar residência atual em Lajes Pintadas, exigir cidade e UF compatíveis
        IF p_casa_proof_type IN ('RESIDENTE', 'NATURAL_E_RESIDENTE') THEN
            IF lower(trim(p_city)) <> 'lajes pintadas' OR upper(trim(p_state)) <> 'RN' THEN
                RAISE EXCEPTION 'Quem declara residência atual em Lajes Pintadas deve informar Lajes Pintadas como Cidade e RN como UF.';
            END IF;
        END IF;
        
        -- Categoria calculada
        IF p_gender = 'MASCULINO' THEN
            v_category := 'CASA_MASCULINO';
        ELSE
            v_category := 'CASA_FEMININO';
        END IF;
    ELSE
        -- Visitante
        IF p_gender = 'MASCULINO' THEN
            v_category := 'VISITANTE_MASCULINO';
        ELSE
            v_category := 'VISITANTE_FEMININO';
        END IF;
    END IF;

    -- 5. Impedir inscrição ativa duplicada por CPF no mesmo evento
    SELECT r.* INTO v_existing_active_reg
    FROM registrations r
    JOIN athletes a ON a.id = r.athlete_id
    WHERE a.cpf = v_clean_cpf
      AND r.status IN ('RESERVED', 'CONFIRMED', 'IN_REVIEW')
      AND (r.status <> 'RESERVED' OR r.reservation_expires_at > NOW())
    LIMIT 1;

    IF v_existing_active_reg.id IS NOT NULL THEN
        RAISE EXCEPTION 'Já existe uma inscrição ativa para este CPF (Protocolo: %). Não são permitidas duplicidades.', v_existing_active_reg.protocol;
    END IF;

    -- 6. Verificar Capacidade Geral do Evento (se configurada)
    IF v_settings.max_capacity IS NOT NULL THEN
        SELECT COUNT(*) INTO v_total_active_regs
        FROM registrations
        WHERE status IN ('CONFIRMED', 'IN_REVIEW')
           OR (status = 'RESERVED' AND reservation_expires_at > NOW());
           
        IF v_total_active_regs >= v_settings.max_capacity THEN
            -- Atualizar status do evento para SOLD_OUT
            UPDATE event_settings SET status = 'SOLD_OUT', updated_at = NOW();
            RAISE EXCEPTION 'Vagas esgotadas para a 5ª Corrida de Emancipação.';
        END IF;
    END IF;

    -- 6.1 Verificar Cota Específica da Categoria (Local vs Visitante)
    IF p_origin_type = 'CASA' AND v_settings.local_max_capacity IS NOT NULL THEN
        SELECT COUNT(*) INTO v_category_active_regs
        FROM registrations
        WHERE origin_type = 'CASA'
          AND (status IN ('CONFIRMED', 'IN_REVIEW') OR (status = 'RESERVED' AND reservation_expires_at > NOW()));
        IF v_category_active_regs >= v_settings.local_max_capacity THEN
            RAISE EXCEPTION 'Vagas esgotadas para a categoria Local (Lajespintadense).';
        END IF;
    ELSIF p_origin_type = 'VISITANTE' AND v_settings.visitor_max_capacity IS NOT NULL THEN
        SELECT COUNT(*) INTO v_category_active_regs
        FROM registrations
        WHERE origin_type = 'VISITANTE'
          AND (status IN ('CONFIRMED', 'IN_REVIEW') OR (status = 'RESERVED' AND reservation_expires_at > NOW()));
        IF v_category_active_regs >= v_settings.visitor_max_capacity THEN
            RAISE EXCEPTION 'Vagas esgotadas para a categoria Visitante.';
        END IF;
    END IF;

    -- 7. Verificar e Bloquear Linha do Tamanho da Camisa com SELECT FOR UPDATE
    SELECT * INTO v_shirt
    FROM shirt_inventory
    WHERE size = p_shirt_size AND is_active = true
    FOR UPDATE;

    IF v_shirt.id IS NULL THEN
        RAISE EXCEPTION 'Tamanho de camisa inválido ou indisponível: %', p_shirt_size;
    END IF;

    v_available_shirts := v_shirt.total_stock - (v_shirt.reserved_count + v_shirt.confirmed_count);
    IF v_available_shirts <= 0 THEN
        RAISE EXCEPTION 'O estoque da camisa tamanho % esgotou. Por favor, escolha outro tamanho.', p_shirt_size;
    END IF;

    -- 8. Upsert do Atleta
    INSERT INTO athletes (full_name, cpf, birth_date, email, phone, city, state, team, updated_at)
    VALUES (
        trim(p_full_name),
        v_clean_cpf,
        p_birth_date,
        lower(trim(p_email)),
        trim(p_phone),
        trim(p_city),
        upper(trim(p_state)),
        trim(p_team),
        NOW()
    )
    ON CONFLICT (cpf) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        birth_date = EXCLUDED.birth_date,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        team = EXCLUDED.team,
        updated_at = NOW()
    RETURNING id INTO v_athlete_id;

    -- 9. Calcular Preço Oficial no Servidor
    SELECT * INTO v_pricing FROM calculate_registration_pricing(p_payment_method);

    -- 10. Gerar Protocolo e Código de Acesso Imprevisível (Armazenando apenas Hash)
    -- Protocolo: LP5-2026-XXXXX
    v_protocol := 'LP5-' || to_char(NOW(), 'YYMM') || '-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 5));
    -- Código de acesso aleatório de 6 caracteres alfanuméricos seguros
    v_raw_access_code := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    v_access_code_hash := encode(digest(v_raw_access_code, 'sha256'), 'hex');

    -- 11. Incrementar reserva da camisa atomicamente
    UPDATE shirt_inventory
    SET reserved_count = reserved_count + 1, updated_at = NOW()
    WHERE id = v_shirt.id;

    -- 12. Inserir Inscrição com validade de 30 minutos de reserva
    INSERT INTO registrations (
        athlete_id,
        protocol,
        access_code_hash,
        category,
        origin_type,
        gender,
        casa_proof_type,
        shirt_size,
        status,
        financial_status,
        payment_method,
        base_amount_cents,
        processing_fee_cents,
        total_amount_cents,
        reservation_expires_at,
        terms_version,
        terms_accepted_at,
        privacy_version,
        privacy_accepted_at,
        ip_address,
        user_agent
    ) VALUES (
        v_athlete_id,
        v_protocol,
        v_access_code_hash,
        v_category,
        p_origin_type,
        p_gender,
        p_casa_proof_type,
        p_shirt_size,
        'RESERVED',
        'PENDING',
        p_payment_method,
        v_pricing.base_cents,
        v_pricing.fee_cents,
        v_pricing.total_cents,
        NOW() + INTERVAL '30 minutes',
        p_terms_version,
        NOW(),
        p_privacy_version,
        NOW(),
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO v_reg_id;

    -- Retornar payload completo com access_code original para o frontend repassar ao atleta
    RETURN jsonb_build_object(
        'success', true,
        'registration_id', v_reg_id,
        'protocol', v_protocol,
        'access_code', v_raw_access_code,
        'category', v_category,
        'shirt_size', p_shirt_size,
        'base_amount_cents', v_pricing.base_cents,
        'fee_cents', v_pricing.fee_cents,
        'total_amount_cents', v_pricing.total_cents,
        'expires_at', NOW() + INTERVAL '30 minutes'
    );
END;
$$;


-- ==============================================================================
-- CONSULTA SEGURA DO ATLETA (PROTOCOL + CÓDIGO DE ACESSO COM HASH SHA-256)
-- NUNCA expõe dados pessoais apenas por CPF
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_athlete_registration(
    p_protocol TEXT,
    p_access_code TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_hash TEXT;
    v_result JSONB;
BEGIN
    v_hash := encode(digest(upper(trim(p_access_code)), 'sha256'), 'hex');

    SELECT jsonb_build_object(
        'id', r.id,
        'protocol', r.protocol,
        'category', r.category,
        'origin_type', r.origin_type,
        'gender', r.gender,
        'casa_proof_type', r.casa_proof_type,
        'shirt_size', r.shirt_size,
        'status', r.status,
        'financial_status', r.financial_status,
        'payment_method', r.payment_method,
        'base_amount_cents', r.base_amount_cents,
        'processing_fee_cents', r.processing_fee_cents,
        'total_amount_cents', r.total_amount_cents,
        'reservation_expires_at', r.reservation_expires_at,
        'paid_at', r.paid_at,
        'kit_delivered', r.kit_delivered,
        'kit_delivered_at', r.kit_delivered_at,
        'asaas_invoice_url', r.asaas_invoice_url,
        'asaas_pix_qr_code', r.asaas_pix_qr_code,
        'asaas_pix_copy_paste', r.asaas_pix_copy_paste,
        'created_at', r.created_at,
        'athlete', jsonb_build_object(
            'full_name', a.full_name,
            'cpf_masked', substr(a.cpf, 1, 3) || '.***.***-' || substr(a.cpf, 10, 2),
            'city', a.city,
            'state', a.state,
            'team', a.team,
            'email_masked', regexp_replace(a.email, '(^.).*(@.*$)', '\1***\2')
        ),
        'event', (SELECT jsonb_build_object(
            'event_name', event_name,
            'event_date', event_date,
            'distance_km', distance_km,
            'start_time', start_time,
            'start_location', start_location,
            'kit_pickup_info', kit_pickup_info,
            'organizer_contact', organizer_contact
        ) FROM event_settings LIMIT 1)
    ) INTO v_result
    FROM registrations r
    JOIN athletes a ON a.id = r.athlete_id
    WHERE upper(trim(r.protocol)) = upper(trim(p_protocol))
      AND r.access_code_hash = v_hash;

    IF v_result IS NULL THEN
        RAISE EXCEPTION 'Inscrição não encontrada ou Código de Acesso incorreto.';
    END IF;

    RETURN v_result;
END;
$$;


-- ==============================================================================
-- PROCESSAMENTO DO WEBHOOK ASAAS COM IDEMPOTÊNCIA E VALIDAÇÃO FINANCEIRA
-- ==============================================================================
CREATE OR REPLACE FUNCTION process_asaas_webhook_event(
    p_event_type TEXT,
    p_payment_id TEXT,
    p_status TEXT,
    p_value_cents INTEGER,
    p_net_value_cents INTEGER,
    p_payload JSONB
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_reg registrations%ROWTYPE;
    v_shirt shirt_inventory%ROWTYPE;
    v_fee_discrepancy INTEGER;
BEGIN
    -- 1. Buscar a inscrição vinculada ao payment_id do Asaas
    SELECT * INTO v_reg
    FROM registrations
    WHERE asaas_payment_id = p_payment_id
    FOR UPDATE;

    IF v_reg.id IS NULL THEN
        -- Registrar webhook não localizado para conferência administrativa
        INSERT INTO webhook_logs (event_type, payment_id, signature_valid, processed, error_message, payload)
        VALUES (p_event_type, p_payment_id, true, false, 'Cobrança não encontrada no banco local', p_payload);
        
        RETURN jsonb_build_object('success', false, 'message', 'Cobrança não encontrada');
    END IF;

    -- 2. Tratamento por tipo de evento do Asaas
    IF p_event_type IN ('PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED') THEN
        -- Conferir valor pago! Se divergente, marcar como IN_REVIEW
        IF p_value_cents <> v_reg.total_amount_cents THEN
            UPDATE registrations
            SET status = 'IN_REVIEW',
                financial_status = 'IN_ANALYSIS',
                updated_at = NOW()
            WHERE id = v_reg.id;

            INSERT INTO webhook_logs (event_type, payment_id, signature_valid, processed, error_message, payload)
            VALUES (p_event_type, p_payment_id, true, true, 'Valor divergente. Enviado para conferência administrativa.', p_payload);

            RETURN jsonb_build_object('success', true, 'status', 'IN_REVIEW', 'reason', 'Divergência de valor');
        END IF;

        -- Idempotência: Se já estava confirmada, não duplicar movimentação de estoque
        IF v_reg.status <> 'CONFIRMED' THEN
            -- Se a reserva já havia expirado (pagamento tardio), verificar se a vaga/camisa ainda existe
            SELECT * INTO v_shirt FROM shirt_inventory WHERE size = v_reg.shirt_size FOR UPDATE;

            IF v_reg.status = 'EXPIRED' THEN
                -- Tentar re-alocar camisa
                IF (v_shirt.total_stock - (v_shirt.reserved_count + v_shirt.confirmed_count)) > 0 THEN
                    UPDATE shirt_inventory
                    SET confirmed_count = confirmed_count + 1, updated_at = NOW()
                    WHERE id = v_shirt.id;
                    
                    UPDATE registrations
                    SET status = 'CONFIRMED',
                        financial_status = CASE WHEN p_event_type = 'PAYMENT_RECEIVED' THEN 'RECEIVED'::financial_status_enum ELSE 'CONFIRMED'::financial_status_enum END,
                        paid_at = NOW(),
                        net_received_cents = p_net_value_cents,
                        updated_at = NOW()
                    WHERE id = v_reg.id;
                ELSE
                    -- Sem estoque da camisa após expiração: manter em revisão administrativa
                    UPDATE registrations
                    SET status = 'IN_REVIEW',
                        financial_status = 'RECEIVED',
                        paid_at = NOW(),
                        net_received_cents = p_net_value_cents,
                        updated_at = NOW()
                    WHERE id = v_reg.id;
                END IF;
            ELSE
                -- Transição normal de RESERVED para CONFIRMED
                UPDATE shirt_inventory
                SET reserved_count = GREATEST(0, reserved_count - 1),
                    confirmed_count = confirmed_count + 1,
                    updated_at = NOW()
                WHERE id = v_shirt.id;

                UPDATE registrations
                SET status = 'CONFIRMED',
                    financial_status = CASE WHEN p_event_type = 'PAYMENT_RECEIVED' THEN 'RECEIVED'::financial_status_enum ELSE 'CONFIRMED'::financial_status_enum END,
                    paid_at = NOW(),
                    net_received_cents = p_net_value_cents,
                    updated_at = NOW()
                WHERE id = v_reg.id;
            END IF;
        ELSE
            -- Já confirmada, atualizar apenas financial_status se recebido
            IF p_event_type = 'PAYMENT_RECEIVED' THEN
                UPDATE registrations
                SET financial_status = 'RECEIVED',
                    net_received_cents = p_net_value_cents,
                    updated_at = NOW()
                WHERE id = v_reg.id;
            END IF;
        END IF;

    ELSIF p_event_type IN ('PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED') THEN
        -- Estorno ou contestação
        IF v_reg.status = 'CONFIRMED' THEN
            -- Liberar camisa confirmada
            UPDATE shirt_inventory
            SET confirmed_count = GREATEST(0, confirmed_count - 1),
                updated_at = NOW()
            WHERE size = v_reg.shirt_size;
        ELSIF v_reg.status = 'RESERVED' THEN
            UPDATE shirt_inventory
            SET reserved_count = GREATEST(0, reserved_count - 1),
                updated_at = NOW()
            WHERE size = v_reg.shirt_size;
        END IF;

        UPDATE registrations
        SET status = 'REFUNDED',
            financial_status = CASE WHEN p_event_type = 'PAYMENT_REFUNDED' THEN 'REFUNDED'::financial_status_enum ELSE 'DISPUTED'::financial_status_enum END,
            updated_at = NOW()
        WHERE id = v_reg.id;

    ELSIF p_event_type IN ('PAYMENT_OVERDUE', 'PAYMENT_DELETED') THEN
        -- Cobrança expirada ou cancelada
        IF v_reg.status = 'RESERVED' THEN
            -- Liberar camisa reservada
            UPDATE shirt_inventory
            SET reserved_count = GREATEST(0, reserved_count - 1),
                updated_at = NOW()
            WHERE size = v_reg.shirt_size;

            UPDATE registrations
            SET status = 'EXPIRED',
                financial_status = 'OVERDUE',
                updated_at = NOW()
            WHERE id = v_reg.id;
        END IF;
    END IF;

    -- Registrar webhook processado
    INSERT INTO webhook_logs (event_type, payment_id, signature_valid, processed, payload)
    VALUES (p_event_type, p_payment_id, true, true, p_payload);

    RETURN jsonb_build_object('success', true, 'status', 'processed');
END;
$$;


-- ==============================================================================
-- ROTINA DE EXPIRAÇÃO DE RESERVAS PENDENTES (EXECUTADA PERIODICAMENTE)
-- ==============================================================================
CREATE OR REPLACE FUNCTION expire_stale_reservations()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    r RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR r IN
        SELECT id, shirt_size
        FROM registrations
        WHERE status = 'RESERVED'
          AND reservation_expires_at < NOW()
        FOR UPDATE SKIP LOCKED
    LOOP
        -- Liberar estoque reservado
        UPDATE shirt_inventory
        SET reserved_count = GREATEST(0, reserved_count - 1),
            updated_at = NOW()
        WHERE size = r.shirt_size;

        -- Marcar como expirada
        UPDATE registrations
        SET status = 'EXPIRED',
            financial_status = 'OVERDUE',
            updated_at = NOW()
        WHERE id = r.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;


-- ==============================================================================
-- REGISTRO DE ENTREGA DO KIT (COM PREVENÇÃO DE DUPLICIDADE)
-- ==============================================================================
CREATE OR REPLACE FUNCTION deliver_athlete_kit(
    p_registration_id UUID,
    p_delivered_by TEXT,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_reg registrations%ROWTYPE;
BEGIN
    SELECT * INTO v_reg
    FROM registrations
    WHERE id = p_registration_id
    FOR UPDATE;

    IF v_reg.id IS NULL THEN
        RAISE EXCEPTION 'Inscrição não encontrada.';
    END IF;

    IF v_reg.status <> 'CONFIRMED' THEN
        RAISE EXCEPTION 'Entrega bloqueada: Inscrição não está CONFIRMADA (Situação atual: %).', v_reg.status;
    END IF;

    IF v_reg.kit_delivered THEN
        RAISE EXCEPTION 'Alerta de duplicidade: O kit desta inscrição já foi entregue em % por %.',
            to_char(v_reg.kit_delivered_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'),
            v_reg.kit_delivered_by;
    END IF;

    UPDATE registrations
    SET kit_delivered = TRUE,
        kit_delivered_at = NOW(),
        kit_delivered_by = p_delivered_by,
        kit_notes = p_notes,
        updated_at = NOW()
    WHERE id = v_reg.id;

    RETURN jsonb_build_object(
        'success', true,
        'protocol', v_reg.protocol,
        'delivered_at', NOW(),
        'delivered_by', p_delivered_by
    );
END;
$$;

-- ==============================================================================
-- MIGRAÇÃO INCREMENTAL: ATENDIMENTO PRESENCIAL (CATEGORIA CASA - PREFEITURA)
-- ==============================================================================
-- Compatível com registros históricos (preserva integridade e não recria tabelas)
ALTER TABLE registrations 
    ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'ONLINE',
    ADD COLUMN IF NOT EXISTS document_verification_status TEXT DEFAULT 'PENDENTE',
    ADD COLUMN IF NOT EXISTS document_type_presented TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS document_verification_notes TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS document_checked_by TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS document_checked_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS attendant_name TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS attendant_id TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_channel ON registrations(channel);
CREATE INDEX IF NOT EXISTS idx_registrations_doc_status ON registrations(document_verification_status);
CREATE INDEX IF NOT EXISTS idx_registrations_attendant ON registrations(attendant_name);

