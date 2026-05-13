/**
 * Helpers for building contract relationship payloads.
 *
 * parentRelationship — hợp đồng CHA (hợp đồng gốc đã hết hạn, đang được gia hạn)
 *   relationType = 1 (RenewalContract) — chỉ có ở luồng Renew
 *
 * childRelationships — hợp đồng mà HĐ mới này LIÊN KẾT TỚI
 *   relationType = 0 (LinkedContract) — HĐ kinh tế liên kết với HĐ nguyên tắc
 *
 * Hai trường độc lập, có thể có cả hai hoặc chỉ một.
 */
export const RELATION_TYPE = {
  LinkedContract:  0, // childRelationships — kinh tế liên kết nguyên tắc
  RenewalContract: 1, // parentRelationship — gia hạn từ hợp đồng cũ
} as const;

/**
 * @param linkedContractId  - ID hợp đồng nguyên tắc mà HĐ kinh tế này liên kết tới
 *                            → vào childRelationships[0], relationType=0
 * @param renewalParentId   - ID hợp đồng gốc đã hết hạn (chỉ luồng Renew)
 *                            → vào parentRelationship, relationType=1
 */
export function buildRelationshipPayload(
  linkedContractId?: string | null,
  renewalParentId?: string | null,
) {
  return {
    parentRelationship: renewalParentId
      ? { parentContractId: renewalParentId, relationType: RELATION_TYPE.RenewalContract }
      : null,

    childRelationships: linkedContractId
      ? [{ childContractId: linkedContractId, relationType: RELATION_TYPE.LinkedContract }]
      : null,
  };
}