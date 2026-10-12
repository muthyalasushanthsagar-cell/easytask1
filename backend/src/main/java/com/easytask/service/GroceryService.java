package com.easytask.service;

import com.easytask.dto.GroceryDTOs.GroceryItemRequest;
import com.easytask.dto.GroceryDTOs.GroceryItemResponse;
import com.easytask.dto.GroceryDTOs.GroceryListRequest;
import com.easytask.dto.GroceryDTOs.GroceryListResponse;
import com.easytask.entity.GroceryItem;
import com.easytask.entity.GroceryList;
import com.easytask.exception.ResourceNotFoundException;
import com.easytask.repository.GroceryItemRepository;
import com.easytask.repository.GroceryListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroceryService {

    private static final String DEFAULT_COLOR = "#4f46e5";

    private final GroceryListRepository listRepository;
    private final GroceryItemRepository itemRepository;
    private final Clock clock;

    public GroceryService(GroceryListRepository listRepository, GroceryItemRepository itemRepository, Clock clock) {
        this.listRepository = listRepository;
        this.itemRepository = itemRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<GroceryListResponse> getAll() {
        return listRepository.findAllByOrderByIdDesc().stream()
                .map(GroceryListResponse::from)
                .toList();
    }

    @Transactional
    public GroceryListResponse createList(GroceryListRequest request) {
        GroceryList list = new GroceryList();
        list.setCreatedAt(LocalDateTime.now(clock));
        applyList(list, request);
        return GroceryListResponse.from(listRepository.save(list));
    }

    @Transactional
    public GroceryListResponse updateList(Long id, GroceryListRequest request) {
        GroceryList list = findList(id);
        applyList(list, request);
        return GroceryListResponse.from(listRepository.save(list));
    }

    @Transactional
    public void deleteList(Long id) {
        listRepository.delete(findList(id));
    }

    @Transactional
    public GroceryItemResponse addItem(Long listId, GroceryItemRequest request) {
        GroceryList list = findList(listId);
        GroceryItem item = new GroceryItem();
        item.setName(request.name().trim());
        item.setQuantity(request.quantity() != null ? request.quantity() : 1.0);
        item.setUnit(blankToNull(request.unit()));
        item.setCategory(blankToNull(request.category()));
        item.setPurchased(false);
        item.setList(list);
        GroceryItem saved = itemRepository.save(item);
        return GroceryItemResponse.from(saved);
    }

    @Transactional
    public GroceryItemResponse toggleItem(Long itemId) {
        GroceryItem item = findItem(itemId);
        item.setPurchased(!item.isPurchased());
        return GroceryItemResponse.from(itemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long itemId) {
        itemRepository.delete(findItem(itemId));
    }

    private void applyList(GroceryList list, GroceryListRequest request) {
        list.setTitle(request.title().trim());
        list.setDescription(blankToNull(request.description()));
        String color = blankToNull(request.color());
        list.setColor(color != null ? color : DEFAULT_COLOR);
    }

    private GroceryList findList(Long id) {
        return listRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found with id " + id));
    }

    private GroceryItem findItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found with id " + id));
    }

    private static String blankToNull(String s) {
        return s == null || s.trim().isEmpty() ? null : s.trim();
    }
}
